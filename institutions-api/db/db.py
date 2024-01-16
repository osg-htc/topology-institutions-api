from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker, Session
from os import environ
import urllib.parse
from .db_models import *
from ..util.oidc_utils import OIDCUserInfo
from ..models.api_models import InstitutionModel, OSG_ID_PREFIX
# TODO not the best practice to return http errors from db layer
from fastapi import HTTPException

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

def _full_osg_id(short_id):
    """ Get the full osg-htc url of an institution based on its ID suffix """
    return f"{OSG_ID_PREFIX}{short_id}"


def get_institutions() -> List[InstitutionModel]:
    """ Get a sorted list of every valid institution """
    with DbSession() as session:
        institutions = session.scalars(select(Institution)
            .where(Institution.valid)
            .order_by(Institution.name)).all()
        return [InstitutionModel.from_institution(i) for i in institutions]

def get_institution(short_id: str) -> InstitutionModel:
    """ Get an existing institution by ID """
    with DbSession() as session:
        institution = session.scalar(select(Institution)
                .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if institution is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        return InstitutionModel.from_institution(institution)

def add_institution(institution: InstitutionModel, author: OIDCUserInfo):
    """ Create a new institution """
    with DbSession() as session:
        inst = Institution(institution.name, institution.id, author.id)
        if institution.ror_id:
            inst.identifiers = [InstitutionIdentifier(_ror_id_type(session), institution.ror_id)]
        session.add(inst)
        session.commit()

def update_institution(short_id: str, institution: InstitutionModel, author: OIDCUserInfo):
    """ Update an existing institution """
    with DbSession() as session:
        to_update = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if to_update is None:
            return HTTPException(404, f"No institution found with id {short_id}")
        
        to_update.name = institution.name

        # delete any existing ror ids, then recreate one if given.
        ror_id_type = _ror_id_type(session)
        session.execute(delete(InstitutionIdentifier)
            .where(InstitutionIdentifier.institution_id == to_update.id)
            .where(InstitutionIdentifier.identifier_type_id == ror_id_type.id))
        if institution.ror_id:
            session.add(InstitutionIdentifier(ror_id_type, institution.ror_id, to_update.id))

        to_update.updated_by = author.id
        session.commit()

def invalidate_institution(short_id: str, author: OIDCUserInfo):
    """ Mark an existing institution as invalid by id """
    with DbSession() as session:
        to_invalidate = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))
        to_invalidate.valid = False
        to_invalidate.updated_by = author.id
        session.commit()
