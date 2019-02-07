#!/bin/sh

# certbot certonly --standalone -n --email contact@buckless.com --agree-tos \
#   clientname.inst.buckless.com \
#   admin.clientname.inst.buckless.com \
#   client.clientname.inst.buckless.com \
#   api.clientname.inst.buckless.com \
#   images.clientname.inst.buckless.com

export DOCKER_LOCALHOST=$(ip route | awk 'NR==1 {print $3}')
echo "$DOCKER_LOCALHOST docker_localhost" >> /etc/hosts

echo "Running nginx"
exec nginx -g "daemon off;"
