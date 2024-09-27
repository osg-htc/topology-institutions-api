FROM node:21.5.0 AS build-step
WORKDIR /build

RUN npm install -g @angular/cli

COPY institutions-ui/ /build/
RUN npm install
RUN ng build --base-href /ui/

FROM nginx:latest

COPY --from=build-step /build/dist/institutions-ui/browser/ /usr/share/nginx/html
COPY ../nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
