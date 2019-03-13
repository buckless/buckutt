FROM lab.buckless.com:4567/buckless/buckless/admin

COPY config.json /usr/src/buckless-admin/packages/config/config.json

RUN yarn run config build
RUN yarn admin build
