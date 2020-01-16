FROM nginx:alpine

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh && \
  apk update && \
  apk add --no-cache certbot

ENTRYPOINT /docker-entrypoint.sh
