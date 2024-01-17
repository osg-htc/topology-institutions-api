from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship, Mapped
from typing import List
from uuid import uuid4

class Base(DeclarativeBase):
    pass


class IdentifierType(Base):
    """ ORM for types of alternate institution identifier """
    __tablename__ = 'identifier_type'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, unique=True)
    description = Column(String)

class Institution(Base):
    """ ORM for Topology institutions """
    __tablename__ = 'institution'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    topology_identifier = Column(String, unique=True, nullable=False)
    name = Column(String, unique=True, nullable=False)
    valid = Column(Boolean, default=True)

    created = Column(DateTime, nullable=False, server_default=func.now())
    updated = Column(DateTime, onupdate=func.now())

    created_by = Column(String, nullable=False)
    updated_by = Column(String)

    identifiers: Mapped[List["InstitutionIdentifier"]] = relationship(cascade="delete")


    def __init__(self, name, topology_identifier, created_by):
        self.id = uuid4()
        self.name = name
        self.topology_identifier = topology_identifier
        self.created_by = created_by

    def has_id_of_type(self, id_type: IdentifierType):
        return any(i.identifier_type_id == id_type.id for i in self.identifiers)


class InstitutionIdentifier(Base):
    """ ORM for alternate institution identifiers """
    __tablename__ = 'institution_identifier'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    identifier = Column(String, nullable=False)

    institution_id: Mapped[UUID] = mapped_column(ForeignKey('institution.id'))
    identifier_type_id: Mapped[UUID] = mapped_column(ForeignKey('identifier_type.id'))


    identifier_type: Mapped["IdentifierType"] = relationship()


    def __init__(self, identifier_type: IdentifierType, identifier: str, institution_id: UUID = None):
        self.identifier_type_id = identifier_type.id
        self.identifier = identifier
        self.institution_id = institution_id
