from fastapi import FastAPI
from a2wsgi import ASGIMiddleware
# from db.db import DbSession

app = FastAPI()

@app.get('/public')
def hello():
    return 'Hello, public world!'

@app.get('/private')
def hello():
    return 'Hello, private world!'

application = ASGIMiddleware(app)
