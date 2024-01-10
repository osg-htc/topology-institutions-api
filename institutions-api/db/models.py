from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship, Mapped
from typing import List
from uuid import uuid4

class Base(DeclarativeBase):
    pass


class IdentifierType(Base):
    __tablename__ = 'identifier_type'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, unique=True)
    description = Column(String)

class Institution(Base):
    __tablename__ = 'institution'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    topology_identifier = Column(String, unique=True)
    name = Column(String, unique=True)
    valid = Column(Boolean, default=True)

    created = Column(DateTime)
    updated = Column(DateTime, nullable=True)

    created_by = Column(String)
    updated_by = Column(String)

    identifiers: Mapped[List["InstitutionIdentifier"]] = relationship(cascade="delete")


    def __init__(self, name, topology_identifier):
        self.name = name
        self.topology_identifier = topology_identifier



class InstitutionIdentifier(Base):
    __tablename__ = 'institution_identifier'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    identifier = Column(String)

    institution_id: Mapped[UUID] = mapped_column(ForeignKey('institution.id'))
    identifier_type_id: Mapped[UUID] = mapped_column(ForeignKey('identifier_type.id'))


    identifier_type: Mapped["IdentifierType"] = relationship()


    def __init__(self, identifier_type: IdentifierType, identifier: UUID):
        self.identifier_type_id = identifier_type.id
        self.identifier = identifier
