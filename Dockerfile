FROM node:alpine

WORKDIR /usr/src/buckless-client

EXPOSE 8081

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python pcsc-lite-dev && \
    mkdir -p /usr/src/buckless-client

COPY package.json /usr/src/buckless-client/
COPY yarn.lock /usr/src/buckless-client/
COPY ./static /usr/src/buckless-client/static
COPY ./cordova /usr/src/buckless-client/cordova
COPY config/profiles/development.json.example /usr/src/buckless-manager/config/profiles/development.json
COPY config/profiles/production.json.example /usr/src/buckless-manager/config/profiles/production.json

RUN yarn global add node-gyp
RUN yarn --ignore-engines

COPY . /usr/src/buckless-client/
