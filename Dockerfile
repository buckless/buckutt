FROM node:alpine

WORKDIR /usr/src/buckless-manager

EXPOSE 8083

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-manager

COPY package.json /usr/src/buckless-manager/
COPY yarn.lock /usr/src/buckless-manager/
COPY config/profiles/development.json.example /usr/src/buckless-manager/config/profiles/development.json
COPY config/profiles/production.json.example /usr/src/buckless-manager/config/profiles/production.json

RUN yarn

COPY . /usr/src/buckless-manager/
