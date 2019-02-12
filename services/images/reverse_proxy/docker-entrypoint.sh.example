#!/bin/sh

# certbot certonly --standalone -n --email contact@buckless.com --agree-tos \
#   clientname.inst.buckless.com \
#   admin.clientname.inst.buckless.com \
#   client.clientname.inst.buckless.com \
#   api.clientname.inst.buckless.com \
#   images.clientname.inst.buckless.com

echo "192.168.0.24 host.docker.internal" >> /etc/hosts

echo "Running nginx"
exec nginx -g "daemon off;"
