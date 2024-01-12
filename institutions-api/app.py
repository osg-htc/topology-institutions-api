from fastapi import FastAPI, HTTPException, APIRouter, Request, Header
from .db import db
from sqlalchemy import select, delete
from .db.models import Institution
from .models.models import InstitutionModel
from .util.oidc_utils import OIDCUserInfo
from os import environ
import logging
from functools import wraps

logger = logging.getLogger("default")

api_prefix = environ['API_PREFIX']
app = FastAPI()
prefix_router = APIRouter(prefix=api_prefix)

# TODO a more elegant solution
# hack to deal with apache not logging fastAPI's exceptions by default
def with_error_logging(func):
    @wraps(func)
    def wrapper(*args,**kwargs):
        try:
            return func(*args,**kwargs)
        except HTTPException as e:
            raise e
        except Exception as e:
            logger.error(f"{e}")
            raise HTTPException(500, f"{e}")
    return wrapper

@prefix_router.get('/institution_ids')
@with_error_logging
def get_institution_ids():
    return db.get_institutions()

@prefix_router.get('/institutions/{institution_id}')
@with_error_logging
def get_institution(institution_id: str):
    return db.get_institution(institution_id)


@prefix_router.post('/institutions')
@with_error_logging
def post_institution(institution: InstitutionModel, request: Request):
    db.add_institution(institution, OIDCUserInfo(request))
    return "ok"

@prefix_router.put('/institutions/{institution_id}')
@with_error_logging
def update_institution(institution_id: str, institution: InstitutionModel, request: Request):
    db.update_institution(institution_id, institution, OIDCUserInfo(request))
    return "ok"



@prefix_router.delete('/institutions/{institution_id}')
@with_error_logging
def invalidate_institution(institution_id: str, request: Request):
    db.invalidate_institution(institution_id, OIDCUserInfo(request))
    return "ok"

app.include_router(prefix_router)
