from typing import Optional
from fastapi import Request

class OIDCUserInfo:
    """ Util class for reading OIDC user info from the request scope """
    idp: Optional[str]
    id: Optional[str]
    name: Optional[str]
    email: Optional[str]

    def __init__(self, request: Request):
        self.idp = request.headers.get('oidc_claim_idp_name', None)
        self.id = request.headers.get('oidc_claim_osgid', None)
        self.name = request.headers.get('oidc_claim_name', None)
        self.email = request.headers.get('oidc_claim_email', None)
