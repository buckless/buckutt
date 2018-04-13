FROM node:alpine

WORKDIR /usr/src/buckless-admin

EXPOSE 8082

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    mkdir -p /usr/src/buckless-admin

COPY package.json /usr/src/buckless-admin/
COPY yarn.lock /usr/src/buckless-admin/

RUN yarn

COPY . /usr/src/buckless-admin/
