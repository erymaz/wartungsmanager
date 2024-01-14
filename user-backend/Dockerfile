FROM node:12-alpine AS builder
ARG BUILD_ENVIRONMENT

WORKDIR /app/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./shared/ /app/shared/

WORKDIR /app/user-backend/
COPY ./user-backend/package.json ./package.json
COPY ./user-backend/package-lock.json ./package-lock.json
RUN npm i --unsafe
COPY ./user-backend/ ./

RUN npm run "compile:${BUILD_ENVIRONMENT}"


##
FROM node:12-alpine AS aggregator

RUN mkdir /app/ \
  && mkdir /app/__root/ \
  && mkdir /app/user-backend/

WORKDIR /app/__root/
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci --unsafe --production

WORKDIR /app/user-backend/
COPY ./user-backend/package.json ./package.json
COPY ./user-backend/package-lock.json ./package-lock.json
RUN npm ci --unsafe --production
COPY --from=builder /app/user-backend/build/ ./build/
COPY --from=builder /app/user-backend/html/ ./html/
COPY --from=builder /app/user-backend/public/ ./public/


##
FROM node:12-alpine
ARG BUILD_ENVIRONMENT

# This places the shared root modules in a separate layer to enable it to be
# shared among all images
COPY --from=aggregator --chown=node /app/__root/ /app/
COPY --from=aggregator --chown=node /app/user-backend/ /app/user-backend/

WORKDIR /app/user-backend/
USER node

VOLUME ["/data"]
EXPOSE 8080

ENV BUILD_ENVIRONMENT ${BUILD_ENVIRONMENT}
CMD npm run "start:${BUILD_ENVIRONMENT}"
