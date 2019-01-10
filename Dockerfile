FROM node:8-alpine

EXPOSE 3400

CMD ["yarn", "start"]

WORKDIR /usr/src/buckless-image-server

RUN apk update && \
    apk add --no-cache git openssh make gcc g++ python && \
    apk add fftw-dev vips-dev --verbose --update-cache --repository https://alpine.global.ssl.fastly.net/alpine/edge/testing/ --repository https://alpine.global.ssl.fastly.net/alpine/edge/main && \
    mkdir -p /usr/src/buckless-image-server

COPY package.json /usr/src/buckless-image-server/
COPY yarn.lock /usr/src/buckless-image-server/

RUN yarn

COPY . /usr/src/buckless-image-server/
