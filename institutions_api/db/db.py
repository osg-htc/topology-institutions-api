from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker, Session
from os import environ
from typing import Optional
import urllib.parse
from .db_models import *
from .error_wrapper import sqlalchemy_http_exceptions
from institutions_api.util.oidc_utils import OIDCUserInfo
from institutions_api.models.api_models import InstitutionModel, OSG_ID_PREFIX
from secrets import choice
from string import ascii_lowercase, digits
from institutions_api.db.metadata_mappings import INSTITUTION_SIZE_MAPPING, PROGRAM_LENGTH_MAPPING, CONTROL_MAPPING
# TODO not the best practice to return http errors from db layer
from fastapi import HTTPException
from institutions_api.util.load_csv import load_csv

# DB connection based on secrets populated by the crunchydata postgres operator
engine = create_engine(
    f'postgresql://{environ["PG_USER"]}:{urllib.parse.quote_plus(environ["PG_PASSWORD"])}@{environ["PG_HOST"]}:{environ["PG_PORT"]}/{environ["PG_DATABASE"]}'
)

Base.metadata.create_all(engine)

DbSession = sessionmaker(bind=engine)

ROR_ID_TYPE = 'ror_id'

def _ror_id_type(session: Session) -> IdentifierType:
    """ Get the IdentifierType entity that corresponds to ROR ID """
    return session.scalars(select(IdentifierType).where(IdentifierType.name == ROR_ID_TYPE)).first()

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
def get_valid_institutions() -> List[InstitutionModel]:
    """ Get a sorted list of every valid institution """
    with DbSession() as session:
        institutions = session.scalars(select(Institution)
            .where(Institution.valid)
            .order_by(Institution.name)).all()
        return [InstitutionModel.from_institution(i) for i in institutions]

@sqlalchemy_http_exceptions
def get_institution_details(short_id: str) -> InstitutionModel:
    """ Get an existing institution by ID """
    with DbSession() as session:
        institution = session.scalar(select(Institution)
                .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if institution is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        return InstitutionModel.from_institution(institution)

@sqlalchemy_http_exceptions
def add_institution(institution: InstitutionModel, author: OIDCUserInfo):
    """ Create a new institution """
    with DbSession() as session:
        if deactivated_id := _check_for_deactivated_institution(session, institution.name):
            session.rollback()
            return update_institution(deactivated_id, institution, author)

        topology_id = _get_unused_osg_id(session)
        inst = Institution(institution.name, topology_id, author.id)
        session.add(inst)
        if institution.ror_id:
            ror_id = InstitutionIdentifier(_ror_id_type(session), institution.ror_id, inst.id)
            session.add(ror_id)

        # Add IPEDS metadata if the institution has an unitid
        if institution.unitid:
            # Load the unitid csv file
            file_path = "institutions_api/db/migrations/add_institution_metadata_0/data/hd2023.csv"
            ipeds_data_df = load_csv(file_path)

            # Find the row in the IPEDS data that corresponds to the unit id
            ipeds_data_row = ipeds_data_df[ipeds_data_df['UNITID'] == int(institution.unitid)].iloc[0]

            # Convert np.float64 to native Python float
            latitude = float(ipeds_data_row.get('LATITUDE', 0))
            longitude = float(ipeds_data_row.get('LONGITUD', 0))

            # Update latitude and longitude for the institution
            inst.latitude = latitude
            inst.longitude = longitude

            # Create or retrieve the InstitutionIdentifier for unitid
            unitid_identifier_type = session.scalar(select(IdentifierType).where(IdentifierType.name == 'unitid'))
            if not unitid_identifier_type:
                raise HTTPException(400, "IdentifierType for 'unitid' not found")

            # Create a new InstitutionIdentifier for the unitid
            institution_identifier = InstitutionIdentifier(
                identifier_type=unitid_identifier_type,
                identifier=institution.unitid,
                institution_id=inst.id
            )
            session.add(institution_identifier)
            session.flush()

            # Create the InstitutionIPEDSMetadata object to store all the metadata
            ipeds_metadata = InstitutionIPEDSMetadata(
                website_address=ipeds_data_row['WEBADDR'],
                historically_black_college_or_university=ipeds_data_row.get('HBCU') == 1,
                tribal_college_or_university=ipeds_data_row.get('TRIBAL') == 1,
                program_length=PROGRAM_LENGTH_MAPPING.get(str(ipeds_data_row.get('ICLEVEL'))),
                control=CONTROL_MAPPING.get(str(ipeds_data_row.get('CONTROL'))),
                state=ipeds_data_row.get('STABBR'),
                institution_size=INSTITUTION_SIZE_MAPPING.get(str(ipeds_data_row.get('INSTSIZE'))),
                institution=inst,
                institution_identifier_id=institution_identifier.id
            )
            # Add the ipeds metadata to the session
            session.add(ipeds_metadata)

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

@sqlalchemy_http_exceptions
def update_institution(short_id: str, institution: InstitutionModel, author: OIDCUserInfo):
    """ Update an existing institution """
    with DbSession() as session:
        to_update = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if to_update is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        to_update.name = institution.name
        _update_institution_ror_id(session, to_update, institution.ror_id)
        to_update.updated_by = author.id
        to_update.updated = datetime.now()
        to_update.valid = True

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
