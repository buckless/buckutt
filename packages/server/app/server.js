const express = require('express');
const bodyParser = require('body-parser-with-msgpack');
const msgpackResponse = require('msgpack-response');
const compression = require('compression');
const cors = require('cors');
const api = require('@/routes');
const purchasesWebservices = require('@/utils/purchasesWebservices');
const APIError = require('@/utils/APIError');

const app = express();

app.use(
    cors({
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Fingerprint',
            'X-Signature',
            'Idempotency-Key'
        ],
        credentials: true,
        exposedHeaders: ['device', 'point', 'pointName', 'event', 'eventName', 'wiket'],
        origin: true
    })
);

app.use(bodyParser.msgpack({ limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));

app.use(msgpackResponse({ auto_detect: true }));

app.use(
    compression({
        // do not compress event-source request, non supported by browsers
        filter: req => req.originalUrl.indexOf('/api/v1/live') === -1
    })
);

// app.use(require('@/middlewares/exposeResBody'));

// notify webservices when a purchase is created
purchasesWebservices(app);

// reload setup
app.use(require('@/providers/reload').setup);

// api routes
app.use('/api/v1', api);

// 404 handling
app.use((req, __, next) => {
    next(new APIError(module, 404, 'Not Found', req.path));
});

// other errors handling
app.use(require('@/middlewares/errors'));

module.exports = app;
