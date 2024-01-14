## Builder
FROM node:14-alpine AS builder
ARG BUILD_ENVIRONMENT

RUN apk add python3 make g++ --update

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/asset-frontend/
COPY ./asset-frontend/package.json ./package.json
COPY ./asset-frontend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./asset-frontend/ ./

RUN npm run "build:${BUILD_ENVIRONMENT}"


## Final image
FROM nginx

RUN rm -rf /usr/share/nginx/html/*

COPY ./asset-frontend/_fixtures/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/asset-frontend/dist/angular-starter /usr/share/nginx/html

EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]

