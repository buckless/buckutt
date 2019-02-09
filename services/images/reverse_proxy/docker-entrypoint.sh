#!/bin/sh

# certbot certonly --standalone -n --email contact@buckless.com --agree-tos \
#   clientname.inst.buckless.com \
#   admin.clientname.inst.buckless.com \
#   client.clientname.inst.buckless.com \
#   api.clientname.inst.buckless.com \
#   images.clientname.inst.buckless.com

echo "127.0.0.1 docker_localhost" >> /etc/hosts

echo "Running nginx"
exec nginx -g "daemon off;"
