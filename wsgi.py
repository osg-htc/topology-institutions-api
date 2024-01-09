import sys
import os

HERE = os.path.dirname(__file__)
sys.path.append(HERE)

from app import app
from a2wsgi import ASGIMiddleware


application = ASGIMiddleware(app.app)
