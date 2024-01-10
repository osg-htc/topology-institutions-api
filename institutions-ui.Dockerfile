FROM node:21.5.0 AS build-step

WORKDIR /build
COPY institutions-ui/ /build/

RUN npm install 
RUN npm run build

FROM nginx:latest

COPY --from=build-step /build/dist/institutions-ui/browser/ /usr/share/nginx/html

EXPOSE 80
