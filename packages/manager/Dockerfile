FROM node:11-alpine

WORKDIR /usr/src/buckless-manager

EXPOSE 8083

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-manager/packages/manager && \
    mkdir -p /usr/src/buckless-manager/packages/config && \
    mkdir -p /usr/src/buckless-manager/packages/vue-cli-plugin-calm-serve

COPY ./packages/manager/package.json \
     ./packages/manager/yarn.lock \
     /usr/src/buckless-manager/packages/manager/

COPY .browserlistrc \
     .eslintignore \
     .eslintrc.js \
     babel.config.js \
     postcss.config.js \
     prettier.config.js \
     yarn.lock \
     package.json \
     /usr/src/buckless-manager/

COPY ./packages/config /usr/src/buckless-manager/packages/config
COPY ./packages/vue-cli-plugin-calm-serve /usr/src/buckless-manager/packages/vue-cli-plugin-calm-serve

RUN yarn --ignore-engines --ignore-optional --frozen-lockfile

COPY ./packages/manager /usr/src/buckless-manager/packages/manager
