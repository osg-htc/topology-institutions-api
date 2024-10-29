import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from institutions_api.db import db
from institutions_api.models.api_models import InstitutionBaseModel, InstitutionValidatorModel
from institutions_api.util.oidc_utils import OIDCUserInfo

logger = logging.getLogger("default")


app = FastAPI()

origins = [
    "http://localhost:3000",
    ]

app.add_middleware(CORSMiddleware,
    allow_origins=origins, allow_credentials=False, allow_methods=["*"], allow_headers=["*"])

@app.get('/institution_ids')
def get_valid_institutions():
    return db.get_valid_institutions()

@app.get('/institutions/{institution_id}')
def get_institution_details(institution_id: str):
    return db.get_institution_details(institution_id)


@app.post('/institutions')
def post_institution(institution: InstitutionValidatorModel, request: Request):
    db.add_institution(institution, OIDCUserInfo(request))
    return "ok"

@app.put('/institutions/{institution_id}')
def update_institution(institution_id: str, institution: InstitutionValidatorModel, request: Request):
    db.update_institution(institution_id, institution, OIDCUserInfo(request))
    return "ok"

@app.delete('/institutions/{institution_id}')
def invalidate_institution(institution_id: str, request: Request):
    db.invalidate_institution(institution_id, OIDCUserInfo(request))
    return "ok"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8089)
