FROM nginx:1.15.7-alpine

COPY ./docker-entrypoint.sh /docker-entrypoint.sh
COPY ./nginx.conf /etc/nginx/nginx.conf

RUN chmod +x /docker-entrypoint.sh && \
  apk update && \
  apk add --no-cache certbot nginx-mod-http-lua lua-crypto-dev lua-crypto

ENTRYPOINT /docker-entrypoint.sh
