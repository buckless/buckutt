FROM node:alpine

WORKDIR /usr/src/buckless-client

EXPOSE 8081

CMD ["yarn", "build:browser"]

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python pcsc-lite-dev && \
    mkdir -p /usr/src/buckless-client

COPY package.json /usr/src/buckless-client/
COPY yarn.lock /usr/src/buckless-client/
COPY ./config /usr/src/buckless-client/config
COPY ./static /usr/src/buckless-client/static
COPY ./cordova /usr/src/buckless-client/cordova

RUN yarn global add node-gyp
RUN yarn

COPY . /usr/src/buckless-client/
