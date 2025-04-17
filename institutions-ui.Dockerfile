FROM node:lts AS build-step
WORKDIR /build

COPY institutions_ui/package.json institutions_ui/package-lock.json ./
RUN npm install

COPY institutions_ui/ /build/
RUN npm run build

FROM nginx:latest

COPY --from=build-step /build/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
