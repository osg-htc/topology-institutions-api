from typing import Optional
from fastapi import HTTPException
import requests
from models.api_models import ROR_ID_PREFIX


def validate_ror_id(ror_id: Optional[str]):
    """ Check whether an ROR ID is valid by performing a HEAD request to ror.org """
    # TODO we might want to rate-limit this in some way
    if ror_id and requests.head(ror_id, allow_redirects=True).status_code != 200:
        raise HTTPException(400, f"Invalid ROR ID: institution does not exist. See {ROR_ID_PREFIX}.")
