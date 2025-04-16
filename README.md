### Topology Institutions API

This project contains the source code for a Python webserver that implements
CRUD operations on the topology institutions Postgres database, as well as an Angular
frontend to that API. The frontend and backend are designed to be run in two separate
containers, using Apache to reverse proxy requests to the appropriate destination. 
Read operations to the API are unauthenticated, while write operations are authenticated 
via OIDC. 
 
### Mapped Data

The institutions database uses two data sources for mapping in institutional metadata

#### NCES Data

https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx?gotoReportId=7&fromIpeds=true&sid=9358f236-c875-4a91-b857-00c03a00b65a&rtid=7

HD2023 

#### Carnegie Classifications

##### 2021 Public Data File

Alterations:
- Updated `The Pennsylvania State University` to have id `214777` matching the NCES data

https://carnegieclassifications.acenet.edu/carnegie-classification/resources/


### Webserver

The `institutions-api/` folder contains a [FastAPI](https://fastapi.tiangolo.com/) application
that implements a CRUD API for reading and modifying the topology institutions Postgres database.
`institutions-api/app.py` contains the application entrypoint and endpoint definitions, 
while `institutions-api/db/` contains implementations of database logic.

A docker image for the backend can be built via

    $ docker build -t topology-institutions-api -f institutions-api.Dockerfile .

The application is hosted behind Apache to facilitate OIDC authentication. FastAPI
implements ASGI rather than WSGI, so the shim `wsgi.py` is provided to enable running the 
application behind Apache.

### Frontend

The `institutions-ui/` folder contains an Angular application with a viewer and editor for the 
institutions list.

The docker image for the frontend can be built via

    $ docker build -t topology-institutions-ui -f institutions-ui.Dockerfile .

The Apache configuration for the backend is expected to contain rules for proxying requests to the `ui/`
route prefix to the frontend's deployment.

### Deployment

The dev site tracks the main branch automatically. 

https://topology-institutions.osgdev.chtc.io

To deploy to production tag an image with a new semver tag and push to the upstream repository. This will trigger a image
to build labeled with that tag. Manually update the tiger production image layer with that label after build is complete.

## API

Running the following will build and deploy this image in a location that it can be pulled from Tiger.

```shell
TAG=0.2.7
```

```shell
docker build --platform linux/amd64 -t hub.opensciencegrid.org/opensciencegrid/topology-institutions-api:$TAG -f institutions-api.Dockerfile .
```

```shell
docker push hub.opensciencegrid.org/opensciencegrid/topology-institutions-api:$TAG
```

```shell
docker run --env-file .env hub.opensciencegrid.org/opensciencegrid/topology-institutions-api:0.2.5
```

## UI

Running the following will build and deploy this image in a location that it can be pulled from Tiger.

```shell
TAG=0.2.7
```

```shell
docker build --platform linux/amd64 -t hub.opensciencegrid.org/opensciencegrid/topology-institutions-ui:$TAG -f institutions-ui.Dockerfile .
```

```shell
docker push hub.opensciencegrid.org/opensciencegrid/topology-institutions-ui:$TAG
```

```shell
docker run -p  --env-file .env hub.opensciencegrid.org/opensciencegrid/topology-institutions-ui:$TAG
```
