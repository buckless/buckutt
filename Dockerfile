FROM node:8-alpine

WORKDIR /usr/src/buckless-admin

EXPOSE 8082

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-admin

COPY package.json /usr/src/buckless-admin/
COPY yarn.lock /usr/src/buckless-admin/
COPY config/profiles/development.json.example /usr/src/buckless-admin/config/profiles/development.json
COPY config/profiles/production.json.example /usr/src/buckless-admin/config/profiles/production.json

RUN yarn --ignore-engines --ignore-optional

COPY . /usr/src/buckless-admin/
