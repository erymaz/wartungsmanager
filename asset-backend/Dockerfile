FROM node:12-alpine AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/asset-backend/
COPY ./asset-backend/package.json ./package.json
COPY ./asset-backend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./asset-backend/ ./

RUN npm run "compile:${BUILD_ENVIRONMENT}"


##
FROM node:12-alpine AS aggregator

RUN mkdir /app/ \
  && mkdir /app/__root/ \
  && mkdir /app/asset-backend/

WORKDIR /app/__root/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --unsafe --production

WORKDIR /app/asset-backend/
COPY ./asset-backend/package.json ./package.json
COPY ./asset-backend/package-lock.json ./package-lock.json
RUN npm ci --unsafe --production
COPY --from=builder /app/asset-backend/build/ ./build/


##
FROM node:12-alpine
ARG BUILD_ENVIRONMENT

# This places the shared root modules in a separate layer to enable it to be
# shared among all images
COPY --from=aggregator --chown=node /app/__root/ /app/
COPY --from=aggregator --chown=node /app/asset-backend/ /app/asset-backend/

WORKDIR /app/asset-backend/
USER node

VOLUME ["/data"]
EXPOSE 8080

ENV BUILD_ENVIRONMENT ${BUILD_ENVIRONMENT}
CMD npm run "start:${BUILD_ENVIRONMENT}"
