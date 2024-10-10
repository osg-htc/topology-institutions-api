FROM node:21.5.0 AS build-step
WORKDIR /build

COPY institutions_ui/ /build/
RUN npm install
RUN npm run build

FROM nginx:latest

COPY --from=build-step /build/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
