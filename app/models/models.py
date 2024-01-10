from pydantic import BaseModel, Field
from typing import Optional, Literal
from ..db.models import Institution


class InstitutionModel(BaseModel):
    name: str = Field(..., description="The name of the institution")
    id: str = Field(..., description="The institution's OSG ID")
    ror_id: Optional[str] = Field(None, description="The institution's research organization registry id (https://ror.org/)")

    @classmethod
    def from_institution(cls, inst: Institution) -> "InstitutionModel":
        ror_ids = [i.identifier for i in inst.identifiers if i.identifier_type.name == 'ror_id']
        return InstitutionModel(
            name=inst.name,
            id = inst.topology_identifier,
            ror_id = ror_ids[0] if ror_ids else None)

