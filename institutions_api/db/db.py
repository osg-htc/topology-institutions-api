from psycopg2.sql import NULL
from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker, Session, joinedload
from os import environ
from typing import Optional
import urllib.parse
from .db_models import *
from .error_wrapper import sqlalchemy_http_exceptions
from institutions_api.util.oidc_utils import OIDCUserInfo
from institutions_api.models.api_models import InstitutionBaseModel,  OSG_ID_PREFIX, InstitutionValidatorModel
from secrets import choice
from string import ascii_lowercase, digits
from institutions_api.db.metadata_mappings import (
    INSTITUTION_SIZE_MAPPING,
    PROGRAM_LENGTH_MAPPING,
    CONTROL_MAPPING,
    CARNEGIE_CLASSIFICATION_MAPPING,
    RESEARCH_ACTIVITY_DESIGNATION_2025_MAPPING
)
# TODO not the best practice to return http errors from db layer
from fastapi import HTTPException

from ..util.load_ipeds_data import load_ipeds_data
from ..util.load_carnegie_data import load_carnegie_data
from ..util.load_carnegie_2025_data import load_carnegie_2025_data

# DB connection based on secrets populated by the crunchydata postgres operator
engine = create_engine(
    f'postgresql://{environ["PG_USER"]}:{urllib.parse.quote_plus(environ["PG_PASSWORD"])}@{environ["PG_HOST"]}:{environ["PG_PORT"]}/{environ["PG_DATABASE"]}'
)

Base.metadata.create_all(engine)

DbSession = sessionmaker(bind=engine)

ROR_ID_TYPE = 'ror_id'
UNIT_ID_TYPE = 'unitid'

def _ror_id_type(session: Session) -> IdentifierType:
    """ Get the IdentifierType entity that corresponds to ROR ID """
    return session.scalars(select(IdentifierType).where(IdentifierType.name == ROR_ID_TYPE)).first()

def _unit_id_type(session: Session) -> IdentifierType:
    """ Get the IdentifierType entity that corresponds to unit ID """
    return session.scalars(select(IdentifierType).where(IdentifierType.name == UNIT_ID_TYPE)).first()

def _full_osg_id(short_id: str):
    """ Get the full osg-htc url of an institution based on its ID suffix """
    return f"{OSG_ID_PREFIX}{short_id}"

def _short_osg_id(full_id: str):
    """ Get the full osg-htc url of an institution based on its ID suffix """
    return full_id.replace(OSG_ID_PREFIX, '')

def _get_unused_osg_id(session: Session):
    """ Generate an unused OSG ID """
    MAX_TRIES = 1000 # Give up after hitting x collisions in a row
    ID_LENGTH = 12

    # TODO actually guaranteeing uniqueness here might be a bit overkill based on ID length
    all_ids = set(session.scalars(select(Institution.topology_identifier)).all())
    for _ in range(MAX_TRIES):
        short_id = ''.join([choice(ascii_lowercase + digits) for _ in range(ID_LENGTH)])
        next_id = f"{OSG_ID_PREFIX}{short_id}"
        if not next_id in all_ids:
            return next_id
    raise HTTPException(500, "Unable to generate new unique ID")

def _check_for_deactivated_institution(session: Session, name: str) -> Optional[str]:
    """ Check if a deactivated institution with the given name exists. Return its short ID if so.
    Used for reactivation workflows
    """
    deactivated_inst = session.scalar(select(Institution).where(Institution.valid == False).where(Institution.name == name))
    return _short_osg_id(deactivated_inst.topology_identifier) if deactivated_inst else None

@sqlalchemy_http_exceptions
def get_valid_institutions() -> List[InstitutionBaseModel]:
    """ Get a sorted list of every valid institution """
    with (DbSession() as session):
        institutions = session.scalars(select(Institution)
            .where(Institution.valid)
            .order_by(Institution.name)
            .options(joinedload(Institution.identifiers))
            .options(joinedload(Institution.ipeds_metadata))
            .options(joinedload(Institution.carnegie_metadata))
        ).unique().all()
        return [InstitutionBaseModel.from_institution(i) for i in institutions]

@sqlalchemy_http_exceptions
def get_institution_details(short_id: str) -> InstitutionBaseModel:
    """ Get an existing institution by ID """
    with DbSession() as session:
        institution = session.scalar(select(Institution)
                .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if institution is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        return InstitutionBaseModel.from_institution(institution)

@sqlalchemy_http_exceptions
def add_institution(institution: InstitutionValidatorModel, author: OIDCUserInfo):
    """ Create a new institution """
    with DbSession() as session:
        if deactivated_id := _check_for_deactivated_institution(session, institution.name):
            session.rollback()
            return update_institution(deactivated_id, institution, author)

        topology_id = _get_unused_osg_id(session)
        inst = Institution(institution.name, institution.latitude, institution.longitude, institution.state, topology_id, author.id)
        session.add(inst)
        if institution.ror_id:
            ror_id = InstitutionIdentifier(_ror_id_type(session), institution.ror_id, inst.id)
            session.add(ror_id)

        # Add IPEDS metadata if the institution has an unitid
        if institution.unitid:
            _update_institution_unit_id(session, inst, institution.unitid)

        session.commit()

def _update_institution_ror_id(session: Session, institution: Institution, ror_id: str):
    """ Handle updates to an institution's joined InstitutionIdentifier of type 'ror_id'
    based on the 'ror_id' value passed in the API model
    """
    ror_id_type = _ror_id_type(session)
    if not ror_id:
        # delete any existing ror ids if null in the
        session.execute(delete(InstitutionIdentifier)
            .where(InstitutionIdentifier.institution_id == institution.id)
            .where(InstitutionIdentifier.identifier_type_id == ror_id_type.id))
    elif institution.has_id_of_type(ror_id_type):
        # Update the ROR ID for the institution if it exists
        existing_ror_id = [i for i in institution.identifiers if i.identifier_type.id == ror_id_type.id][0]
        existing_ror_id.identifier = ror_id
        session.add(existing_ror_id)
    else:
        # create a new ROR ID for the institution
        session.add(InstitutionIdentifier(ror_id_type, ror_id, institution.id))

def _update_institution_unit_id(session: Session, institution: Institution, unit_id: str):
    """ Handle updates to an institution's joined InstitutionIdentifier of type 'unitid'
    based on the 'unitid' value passed in the API model
    """

    unit_id_type = _unit_id_type(session)

    if not unit_id_type:
        raise HTTPException(400, "IdentifierType for 'unitid' not found")

    # If a unitid isn't provided and the institution doesn't have an unitid, return
    if (unit_id is None or unit_id.strip() == "") and institution.ipeds_metadata is None:
        return

    # If the institution has a existing unitid, but the input is null, delete the existing unitid
    if (not unit_id or unit_id.strip() == "") and institution.ipeds_metadata:
        if institution.carnegie_metadata:
            session.delete(institution.carnegie_metadata)

        if institution.ipeds_metadata:
            session.delete(institution.ipeds_metadata)

        session.execute(delete(InstitutionIdentifier)
            .where(InstitutionIdentifier.institution_id == institution.id)
            .where(InstitutionIdentifier.identifier_type_id == unit_id_type.id))

    # There is a unitid passed in
    else:
        ipeds_data = load_ipeds_data()  # load ipeds data
        ipeds_data_row = ipeds_data.get(unit_id)

        if ipeds_data_row is None:
            raise HTTPException(400, f"IPEDS data for unit ID {unit_id} not found")

        # Update the latitude and longitude for the institution
        if institution.latitude is None or institution.longitude is None:
            if "LATITUDE" in ipeds_data_row and "LONGITUD" in ipeds_data_row:
                institution.latitude = float(ipeds_data_row.get('LATITUDE'))
                institution.longitude = float(ipeds_data_row.get('LONGITUD'))
                session.commit()

        # Update the state for the institution
        if institution.state is None:
            institution.state = ipeds_data_row.get('STABBR')
            session.commit()

        # Check if the institution already has an unitid
        existing_unitid = [i for i in institution.identifiers if i.identifier_type_id == unit_id_type.id]

        if existing_unitid:
            # Update the existing unitid
            existing_unitid[0].identifier = unit_id
            session.add(existing_unitid[0])

            ipeds_metadata = institution.ipeds_metadata
            ipeds_metadata.website_address = ipeds_data_row['WEBADDR']
            ipeds_metadata.historically_black_college_or_university = ipeds_data_row.get('HBCU') == 1
            ipeds_metadata.tribal_college_or_university = ipeds_data_row.get('TRIBAL') == 1
            ipeds_metadata.program_length = PROGRAM_LENGTH_MAPPING.get(str(ipeds_data_row.get('ICLEVEL')))
            ipeds_metadata.control = CONTROL_MAPPING.get(str(ipeds_data_row.get('CONTROL')))
            ipeds_metadata.state = ipeds_data_row.get('STABBR')
            ipeds_metadata.institution_size = INSTITUTION_SIZE_MAPPING.get(str(ipeds_data_row.get('INSTSIZE')))
            session.add(ipeds_metadata)

        # if the institution doesn't have an unitid, create a new one
        else:
            # Create a new InstitutionIdentifier for unitid if it doesn't exist
            new_unitid = InstitutionIdentifier(identifier_type=unit_id_type, identifier=unit_id,
                                               institution_id=institution.id)
            session.add(new_unitid)
            session.flush()

            # create a new row of ipeds metadata that stores the metadata for the corresponding unitid
            ipeds_metadata = InstitutionIPEDSMetadata(
                website_address=ipeds_data_row['WEBADDR'],
                historically_black_college_or_university=ipeds_data_row.get('HBCU') == 1,
                tribal_college_or_university=ipeds_data_row.get('TRIBAL') == 1,
                program_length=PROGRAM_LENGTH_MAPPING.get(str(ipeds_data_row.get('ICLEVEL'))),
                control=CONTROL_MAPPING.get(str(ipeds_data_row.get('CONTROL'))),
                state=ipeds_data_row.get('STABBR'),
                institution_size=INSTITUTION_SIZE_MAPPING.get(str(ipeds_data_row.get('INSTSIZE'))),
                institution=institution,
                institution_identifier_id=new_unitid.id
            )
            session.add(ipeds_metadata)

            # Create the InstitutionInstitutionCarnegieClassificationMetadata object to store all the metadata
            carnegie_data_table = load_carnegie_data()
            carnegie_data = carnegie_data_table.get(int(unit_id), {}).get("basic2021", None)
            carnegie_2025_data_table = load_carnegie_2025_data()
            carnegie_2025_data = carnegie_2025_data_table.get(int(unit_id), {}).get("2025 Research Activity Designation", None)
            carnegie_metadata = InstitutionCarnegieClassificationMetadata(
                classification2021=CARNEGIE_CLASSIFICATION_MAPPING.get(str(carnegie_data), None),
                classification2025=RESEARCH_ACTIVITY_DESIGNATION_2025_MAPPING.get(str(carnegie_2025_data), None),
                institution=institution,
                institution_identifier_id=new_unitid.id
            )
            session.add(carnegie_metadata)


@sqlalchemy_http_exceptions
def update_institution(short_id: str, institution: InstitutionValidatorModel, author: OIDCUserInfo):
    """ Update an existing institution """
    with DbSession() as session:
        to_update = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if to_update is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        to_update.name = institution.name
        to_update.updated_by = author.id
        to_update.updated = datetime.now()
        to_update.valid = True
        to_update.latitude = institution.latitude
        to_update.longitude = institution.longitude
        to_update.state = institution.state
        _update_institution_ror_id(session, to_update, institution.ror_id)
        _update_institution_unit_id(session, to_update, institution.unitid)

        session.commit()


@sqlalchemy_http_exceptions
def invalidate_institution(short_id: str, author: OIDCUserInfo):
    """ Mark an existing institution as invalid by id """
    with DbSession() as session:
        to_invalidate = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))
        to_invalidate.valid = False
        to_invalidate.updated_by = author.id
        session.commit()
