FROM node:11-alpine

EXPOSE 3400

CMD ["yarn", "start"]

WORKDIR /usr/src/buckless-image-server

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-image-server/packages/image-server && \
    mkdir -p /usr/src/buckless-image-server/packages/config


COPY ./packages/image-server/package.json \
     /usr/src/buckless-image-server/packages/image-server/

COPY .eslintignore \
     .eslintrc.js \
     yarn.lock \
     package.json \
     /usr/src/buckless-image-server/

COPY ./packages/config /usr/src/buckless-image-server/packages/config

RUN yarn --ignore-engines --ignore-optional --frozen-lockfile

COPY ./packages/image-server /usr/src/buckless-image-server/packages/image-server
