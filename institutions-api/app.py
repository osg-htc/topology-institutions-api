from fastapi import FastAPI, HTTPException, Request, Header
from db import db
from sqlalchemy import select, delete
from db.db_models import Institution
from models.api_models import InstitutionModel
from util.oidc_utils import OIDCUserInfo
from os import environ
import logging
from functools import wraps

logger = logging.getLogger("default")

app = FastAPI()

@app.get('/institution_ids')
def get_valid_institutions():
    return db.get_valid_institutions()

@app.get('/institutions/{institution_id}')
def get_institution_details(institution_id: str):
    return db.get_institution_details(institution_id)


@app.post('/institutions')
def post_institution(institution: InstitutionModel, request: Request):
    db.add_institution(institution, OIDCUserInfo(request))
    return "ok"

@app.put('/institutions/{institution_id}')
def update_institution(institution_id: str, institution: InstitutionModel, request: Request):
    db.update_institution(institution_id, institution, OIDCUserInfo(request))
    return "ok"

@app.delete('/institutions/{institution_id}')
def invalidate_institution(institution_id: str, request: Request):
    db.invalidate_institution(institution_id, OIDCUserInfo(request))
    return "ok"
