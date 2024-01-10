from sqlalchemy import create_engine, select, delete
from sqlalchemy.orm import sessionmaker, Session
from os import environ
import urllib.parse
from .models import *
from ..models.models import InstitutionModel
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
    return session.scalars(select(IdentifierType).where(IdentifierType.name == ROR_ID_TYPE)).first()

def _full_osg_id(short_id):
    return f"https://osg-htc.org/iid/{short_id}"


def get_institution(short_id: str) -> InstitutionModel:
    with DbSession() as session:
        institution = session.scalars(select(Institution)
                .where(Institution.topology_identifier == _full_osg_id(short_id))).first()

        if institution is None:
            return HTTPException(404, f"No institution found with id {short_id}")

        return InstitutionModel.from_institution(institution)

def add_institution(institution: InstitutionModel):
    with DbSession() as session:
        inst = Institution(institution.name, institution.id)
        if institution.ror_id:
            inst.identifiers = [InstitutionIdentifier(_ror_id_type(session), institution.ror_id)]
        session.add(inst)
        session.commit()

def update_institution(short_id: str, institution: InstitutionModel):
    with DbSession() as session:
        to_update = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))

        if to_update is None:
            return HTTPException(404, f"No institution found with id {short_id}")
        
        to_update.name = institution.name

        if institution.ror_id:
            to_update.identifiers = [InstitutionIdentifier(_ror_id_type(session), institution.ror_id)]
        else:
            to_update.identifiers = []
        session.commit()

def delete_institution(short_id: str):
    with DbSession() as session:
        to_delete = session.scalar(select(Institution)
            .where(Institution.topology_identifier == _full_osg_id(short_id)))
        session.delete(to_delete)
        session.commit()
