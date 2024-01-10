from fastapi import FastAPI, HTTPException, Request
from .db import db
from sqlalchemy import select, delete
from .db.models import Institution
from .models.models import InstitutionModel
import logging
from functools import wraps

logger = logging.getLogger("default")
app = FastAPI()

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

@app.get('/institution_ids')
@with_error_logging
def get_institution_ids():
    with db.DbSession() as session:
        institutions = session.scalars(select(Institution).order_by(Institution.name)).all()
        return [InstitutionModel.from_institution(i) for i in institutions]

@app.get('/institutions/{institution_id}')
@with_error_logging
def get_institution(institution_id: str):
    return db.get_institution(institution_id)


@app.post('/institutions')
@with_error_logging
def post_institution(institution: InstitutionModel):
    db.add_institution(institution)
    return "ok"

@app.put('/institutions/{institution_id}')
@with_error_logging
def update_institution(institution_id: str, institution: InstitutionModel):
    db.update_institution(institution_id, institution)
    return "ok"



@app.delete('/institutions/{institution_id}')
@with_error_logging
def delete_institution(institution_id: str):
    db.delete_institution(institution_id)
    return "ok"
