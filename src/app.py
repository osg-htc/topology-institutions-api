from fastapi import FastAPI
from db.db import DbSession

app = FastAPI()

@app.get('/')
def hello():
    return 'Hello, world!'
