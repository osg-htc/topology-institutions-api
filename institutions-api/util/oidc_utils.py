from typing import Optional
from fastapi import Request

class OIDCUserInfo:
    """ Util class for reading OIDC user info from the request scope """
    idp: Optional[str]
    id: Optional[str]
    name: Optional[str]
    email: Optional[str]

    def __init__(self, request: Request):
        environ = request.scope.get('wsgi_environ', {})
        self.idp = environ.get('OIDC_CLAIM_idp_name', None)
        self.id = environ.get('OIDC_CLAIM_osgid', None)
        self.name = environ.get('OIDC_CLAIM_name', None)
        self.email = environ.get('OIDC_CLAIM_email', None)
