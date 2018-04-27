FROM node:alpine

EXPOSE 3000

CMD ["yarn", "start"]

WORKDIR /usr/src/buckless-server

RUN apk update && \
    apk add --no-cache git openssh openssl make gcc g++ python && \
    mkdir -p /usr/src/buckless-server

COPY package.json /usr/src/buckless-server/
COPY yarn.lock /usr/src/buckless-server/
COPY config/profiles/development.json.example /usr/src/buckless-manager/config/profiles/development.json
COPY config/profiles/production.json.example /usr/src/buckless-manager/config/profiles/production.json

RUN yarn

COPY . /usr/src/buckless-server/
