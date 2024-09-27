from pydantic import BaseModel, Field, model_validator
from typing import Optional
from institutions_api.db.db_models import Institution

OSG_ID_PREFIX = "https://osg-htc.org/iid/"
ROR_ID_PREFIX = "https://ror.org/"


class InstitutionIPEDSMetadataModel(BaseModel):
    website_address: Optional[str] = Field(None, description="The institution's website address")
    historically_black_college_or_university: Optional[bool] = Field(None,
                                                                     description="Historically Black College or University")
    tribal_college_or_university: Optional[bool] = Field(None, description="Tribal College or University")
    program_length: Optional[str] = Field(None, description="The length of the institution's programs")
    control: Optional[str] = Field(None, description="The control type of the institution")
    state: Optional[str] = Field(None, description="The state where the institution is located")
    institution_size: Optional[str] = Field(None, description="The size of the institution")

    class Config:
        orm_mode = True

class InstitutionModel(BaseModel):
    """ API model for topology institutions """
    name: str = Field(..., description="The name of the institution")
    id: Optional[str] = Field(None, description="The institution's OSG ID")
    ror_id: Optional[str] = Field(None, description="The institution's research organization registry id (https://ror.org/)")
    unitid: Optional[str] = Field(None, description="The institutions Unit ID used to map information from the IPEDS data system (https://nces.ed.gov/ipeds/use-the-data)")
    longitude: Optional[float] = Field(None, description="The institutions longitude position")
    latitude: Optional[float] = Field(None, description="The institutions latitude position")
    ipeds_metadata: Optional[InstitutionIPEDSMetadataModel] = Field(None, description="The associated IPEDS metadata for this institution")

    @classmethod
    def from_institution(cls, inst: Institution) -> "InstitutionModel":
        ror_ids = [i.identifier for i in inst.identifiers if i.identifier_type.name == 'ror_id']
        unitids = [i.identifier for i in inst.identifiers if i.identifier_type.name == 'unitid']
        return InstitutionModel(
            name=inst.name,
            id=inst.topology_identifier,
            ror_id=ror_ids[0] if ror_ids else None,
            unitid=unitids[0] if unitids else None,
            latitude=inst.latitude,
            longitude=inst.longitude,
            ipeds_metadata=InstitutionIPEDSMetadataModel(**inst.ipeds_metadata.__dict__) if inst.ipeds_metadata else None
        )


    @model_validator(mode='after')
    def check_id_format(self):
        assert self.name, "Name must be non-empty"
        assert (not self.id) or self.id.startswith(OSG_ID_PREFIX), f"OSG ID must start with '{OSG_ID_PREFIX}'"
        assert (not self.ror_id) or self.ror_id.startswith(ROR_ID_PREFIX), f"ROR ID must be empty or start with '{ROR_ID_PREFIX}'"
        return self
