### Topology Institutions API

This project contains the source code for a simple Python webserver that implements
CRUD operations on the topology institutions postgres database, as well as an Angular
frontend to that API. The frontend and backend are designed to be run in two separate
containers, using apache to reverse proxy requests to the appropriate destination. 
Read operations to the api are unauthenticated, while write operations are authenticated 
via OIDC. 


### Webserver

The `institutions-api/` folder contains a [FastAPI](https://fastapi.tiangolo.com/) application
that implements a CRUD api for reading and modifying the topology institutions postgres database.
`institutions-api/app.py` contains the application entrypoint and endpoint definitions, 
while `institutions-api/db/` contains implementations of database logic.

A docker image for the backend can be built via

    $ docker build -t topology-institutions-api -f institutions-api.Dockerfile .

The application is hosted behind Apache to facilitate OIDC authentication. FastAPI
implements ASGI rather than WSGI, so the shim `wsgi.py` is provided to enable running the 
application behind apache.

### Frontend

The `institutions-ui/` folder contains an Angular application with a simple viewer and editor for the 
institutions list.

The docker image for the frontend can be built via

    $ docker build -t topology-institutions-ui -f institutions-ui.Dockerfile .

The apache configuration for the backend is expected to contain rules for proxying requests to the `ui/`
route prefix to the frontend's deployment.
