FROM lab.buckless.com:4567/buckless/buckless/manager

COPY config.json /usr/src/buckless-manager/packages/config/config.json
COPY manager/manifest.json /usr/src/buckless-manager/packages/manager/public/manifest.json
COPY manager/favicon.ico /usr/src/buckless-manager/packages/manager/public/favicon.ico
COPY manager/manager-logo.png /usr/src/buckless-manager/packages/manager/public/img/manager-logo.png
COPY manager/icons /usr/src/buckless-manager/packages/manager/public/img/icons

RUN yarn run config build
RUN yarn manager build
