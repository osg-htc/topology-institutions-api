from typing import Optional
from fastapi import HTTPException
import requests
from institutions_api.constants import ROR_ID_PREFIX

ROR_API_URL = "https://api.ror.org/v2/organizations/"
ROR_API_TIMEOUT_SECONDS = 10


def validate_ror_id(ror_id: Optional[str]):
    """ Check whether an ROR ID exists by looking it up in the ROR API.

    Only a 404 from the API means the ID does not exist. Rate limiting, server
    errors and network failures are reported separately so a valid ID is never
    reported as missing just because ROR could not be reached.
    """
    if not ror_id:
        return

    short_id = ror_id.strip().removeprefix(ROR_ID_PREFIX).strip("/")
    if not short_id:
        raise HTTPException(400, f"Invalid ROR ID: missing identifier after {ROR_ID_PREFIX}.")

    try:
        response = requests.get(f"{ROR_API_URL}{short_id}", timeout=ROR_API_TIMEOUT_SECONDS)
    except requests.RequestException:
        raise HTTPException(503, "Could not reach the ROR API to verify the ROR ID. Please try again later.")

    if response.status_code == 200:
        return
    if response.status_code in (400, 404):
        raise HTTPException(400, f"Invalid ROR ID: institution does not exist. See {ROR_ID_PREFIX}.")
    raise HTTPException(
        503,
        f"Could not verify the ROR ID (ROR API returned {response.status_code}). Please try again later."
    )
