FROM node:11-alpine

WORKDIR /usr/src/buckless-admin

EXPOSE 8082

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-admin/packages/admin && \
    mkdir -p /usr/src/buckless-admin/packages/config && \
    mkdir -p /usr/src/buckless-admin/packages/ui

COPY ./packages/admin/package.json \
     /usr/src/buckless-admin/packages/admin/

COPY .browserlistrc \
     .eslintignore \
     .eslintrc.js \
     babel.config.js \
     postcss.config.js \
     prettier.config.js \
     yarn.lock \
     package.json \
     /usr/src/buckless-admin/

COPY ./packages/config /usr/src/buckless-admin/packages/config
COPY ./packages/ui /usr/src/buckless-admin/packages/ui

RUN yarn install --ignore-engines --ignore-optional --frozen-lockfile

COPY ./packages/admin /usr/src/buckless-admin/packages/admin

