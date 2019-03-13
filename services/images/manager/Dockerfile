FROM lab.buckless.com:4567/buckless/buckless/manager

COPY config.json /usr/src/buckless-manager/packages/config/config.json

RUN yarn run config build
RUN yarn manager build
