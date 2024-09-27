import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Float, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import DeclarativeBase, mapped_column, relationship, Mapped
from typing import List
from uuid import uuid4
from datetime import datetime

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
    latitude = Column(Float)
    longitude = Column(Float)

    created = Column(DateTime, nullable=False, server_default=func.now())
    updated = Column(DateTime, onupdate=func.now())

    created_by = Column(String, nullable=False)
    updated_by = Column(String)

    identifiers: Mapped[List["InstitutionIdentifier"]] = relationship(cascade="delete")
    ipeds_metadata: Mapped["InstitutionIPEDSMetadata"] = relationship(back_populates="institution", lazy="joined")


    def __init__(self, name, topology_identifier, created_by):
        self.id = uuid4()
        self.name = name
        self.topology_identifier = topology_identifier
        self.created_by = created_by
        self.created = datetime.now()

    def has_id_of_type(self, id_type: IdentifierType):
        return any(i.identifier_type_id == id_type.id for i in self.identifiers)


class InstitutionIdentifier(Base):
    """ ORM for alternate institution identifiers """
    __tablename__ = 'institution_identifier'

    # Add unique constraint on identifier_type_id and identifier
    __table_args__ = (
        UniqueConstraint('identifier_type_id', 'identifier'),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    identifier = Column(String, nullable=False)

    institution_id: Mapped[UUID] = mapped_column(ForeignKey('institution.id'))
    identifier_type_id: Mapped[UUID] = mapped_column(ForeignKey('identifier_type.id'))

    identifier_type: Mapped["IdentifierType"] = relationship()
    ipeds_metadata: Mapped["InstitutionIPEDSMetadata"] = relationship(back_populates="identifier")

    def __init__(self, identifier_type: IdentifierType, identifier: str, institution_id: UUID = None):
        self.identifier_type_id = identifier_type.id
        self.identifier = identifier
        self.institution_id = institution_id


# Create enums for the ipeds metadata
class ProgramLength(enum.Enum):
    FOUR_OR_MORE_YEARS = "Four or more years"
    AT_LEAST_TWO_BUT_LESS_THAN_FOUR_YEARS = "At least 2 but less than 4 years"
    LESS_THAN_TWO_YEARS = "Less than 2 years (below associate)"
    NOT_AVAILABLE = "Not available"


class Control(enum.Enum):
    PUBLIC = "Public"
    PRIVATE_NONPROFIT = "Private not-for-profit"
    PRIVATE_FORPROFIT = "Private for-profit"
    NOT_AVAILABLE = "Not available"


class InstitutionSize(enum.Enum):
    UNDER_1000 = "Under 1,000"
    BETWEEN_1000_AND_4999 = "1,000 - 4,999"
    BETWEEN_5000_AND_9999 = "5,000 - 9,999"
    BETWEEN_10000_AND_19999 = "10,000 - 19,999"
    OVER_20000 = "20,000 and above"
    NOT_REPORTED = "Not reported"
    NOT_APPLICABLE = "Not applicable"


class InstitutionIPEDSMetadata(Base):
    """ORM for IPEDS metadata"""
    __tablename__ = 'institution_ipeds_metadata'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Subset of all fields, 2023 source available here: https://nces.ed.gov/ipeds/datacenter/data/HD2023.zip
    website_address = Column(String)                                                           # WEBADDR
    historically_black_college_or_university = Column(Boolean)                                 # HBCU
    tribal_college_or_university = Column(Boolean)                                             # TRIBAL
    program_length = Column(Enum(ProgramLength, name="program_length"))                # ICLEVEL
    control = Column(Enum(Control, name="control"))                                    # CONTROL
    state = Column(String)                                                                     # STABBR
    institution_size = Column(Enum(InstitutionSize, name="institution_size"))          # INSTSIZE

    # Add foreign key to the InstitutionIdentifier
    institution_id: Mapped[UUID] = mapped_column(ForeignKey('institution.id'))
    institution_identifier_id: Mapped[UUID] = mapped_column(ForeignKey('institution_identifier.id'))

    # Get the identifier associated with that fk relationship
    institution: Mapped["Institution"] = relationship(back_populates="ipeds_metadata")
    identifier: Mapped["InstitutionIdentifier"] = relationship(back_populates="ipeds_metadata")
