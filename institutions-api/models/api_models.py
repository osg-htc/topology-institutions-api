from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal
from ..db.db_models import Institution

OSG_ID_PREFIX = "https://osg-htc.org/iid/"
ROR_ID_PREFIX = "https://ror.org/"


class InstitutionModel(BaseModel):
    """ API model for topology institutions """
    name: str = Field(..., description="The name of the institution")
    id: Optional[str] = Field(None, description="The institution's OSG ID")
    ror_id: Optional[str] = Field(None, description="The institution's research organization registry id (https://ror.org/)")

    @classmethod
    def from_institution(cls, inst: Institution) -> "InstitutionModel":
        ror_ids = [i.identifier for i in inst.identifiers if i.identifier_type.name == 'ror_id']
        return InstitutionModel(
            name=inst.name,
            id = inst.topology_identifier,
            ror_id = ror_ids[0] if ror_ids else None)

    @model_validator(mode='after')
    def check_id_format(self):
        assert self.name, "Name must be non-empty"
        assert (not self.id) or self.id.startswith(OSG_ID_PREFIX), f"OSG ID must start with '{OSG_ID_PREFIX}'"
        assert (not self.ror_id) or self.ror_id.startswith(ROR_ID_PREFIX), f"ROR ID must be empty or start with '{ROR_ID_PREFIX}'"
        return self
