FROM keymetrics/pm2:latest-alpine

WORKDIR /usr/src/buckless-server

EXPOSE 3000

CMD ["pm2-runtime", "start", "ecosystem.config.js", "--env", "production"]

RUN apk update && \
    apk add --no-cache git openssh openssl make gcc g++ python && \
    mkdir -p /usr/src/buckless-server/packages/server && \
    mkdir -p /usr/src/buckless-server/packages/config

COPY ./packages/server/package.json \
     ./packages/server/yarn.lock \
     /usr/src/buckless-server/packages/server/

COPY .eslintignore \
     .eslintrc.js \
     yarn.lock \
     package.json \
     /usr/src/buckless-server/

COPY ./packages/config /usr/src/buckless-server/packages/config

RUN yarn --ignore-engines --ignore-optional --frozen-lockfile

COPY ./packages/server /usr/src/buckless-server/packages/server
