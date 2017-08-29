FROM node:alpine

EXPOSE 3000

CMD ["yarn", "start"]

WORKDIR /usr/src/buckless-image-server

RUN apk update && \
    apk add --no-cache git openssh vips-dev && \
    mkdir -p /usr/src/buckless-image-server

COPY package.json /usr/src/buckless-image-server/
COPY yarn.lock /usr/src/buckless-image-server/

RUN yarn

COPY . /usr/src/buckless-image-server/
