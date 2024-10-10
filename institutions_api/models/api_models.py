import os.path

import pandas as pd
from pydantic import BaseModel, Field, model_validator, field_validator
from typing import Optional
from institutions_api.db.db_models import Institution
from institutions_api.util.ror_utils import validate_ror_id
from institutions_api.constants import ROR_ID_PREFIX, OSG_ID_PREFIX

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

    @field_validator('ror_id')
    @classmethod
    def validate_ror(cls, ror_id: Optional[str]):
        validate_ror_id(ror_id)
        return ror_id

    @field_validator('unitid')
    @classmethod
    def validate_unit_id(cls, unitid: Optional[str]):

        # check if the unitid is None
        if unitid is None:
            return unitid

        # check if the unitid is a 6-digit number
        if unitid and (not unitid.isdigit() or len(unitid) != 6):
            raise ValueError("Invalid unit ID: must be a 6-digit number")

        # check if the unitid exists in the IPEDS data system
        file_path = "institutions_api/db/migrations/add_institution_metadata_0/data/hd2023.csv"
        if not os.path.exists(file_path):
            raise ValueError("IPEDS data file not found")

        ipeds_data_df = pd.read_csv(file_path, encoding='latin1')

        # Convert the UNITID column to string, however, this will take a while to convert
        ipeds_data_df['UNITID'] = ipeds_data_df['UNITID'].astype(str)
        ipeds_data = ipeds_data_df.set_index("UNITID").to_dict(orient="index")

        # Check if the unitid exists in the dictionary keys
        if unitid not in ipeds_data:
            raise ValueError("Invalid unit ID: not found in the IPEDS data system")
        return unitid


