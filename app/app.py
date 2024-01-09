from fastapi import FastAPI, HTTPException
from .db.db import DbSession
from sqlalchemy import select
from .db.models import Institution
from .models.models import InstitutionModel
import logging
app = FastAPI()

@app.get('/public')
def hello():
    return 'Hello, public world!'

@app.get('/institution_ids')
def get_institution_ids():
    with DbSession() as session:
        institutions = session.scalars(select(Institution).order_by(Institution.name)).all()
        return [InstitutionModel.from_institution(i) for i in institutions]

@app.get('/public')
def hello():
    return 'Hello, public world!'

@app.get('/private')
def hello():
    return 'Hello, private world!'
