FROM node:alpine

EXPOSE 3400

CMD ["yarn", "start"]

WORKDIR /usr/src/buckless-image-server

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python fftw-dev && \
    apk add vips-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/ && \
    mkdir -p /usr/src/buckless-image-server

COPY package.json /usr/src/buckless-image-server/
COPY yarn.lock /usr/src/buckless-image-server/

RUN yarn

COPY . /usr/src/buckless-image-server/
