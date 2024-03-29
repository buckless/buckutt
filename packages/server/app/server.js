const express = require('express');
const bodyParser = require('body-parser-with-msgpack');
const compression = require('compression');
const cors = require('cors');
const api = require('server/app/routes');
const purchasesWebservices = require('server/app/helpers/purchasesWebservices');
const APIError = require('server/app/utils/APIError');

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

app.use(require('server/app/middlewares/msgpack'));

app.use(
    compression({
        // do not compress event-source request, non supported by browsers
        filter: req => req.originalUrl.indexOf('/api/v1/live') === -1
    })
);

// app.use(require('server/app/middlewares/exposeResBody'));

// notify webservices when a purchase is created
purchasesWebservices(app);

// reload setup
app.use(require('server/app/providers/reload').setup);

// api routes
app.use('/api/v1', api);

// 404 handling
app.use((req, __, next) => {
    next(new APIError(module, 404, 'Not Found', req.path));
});

// other errors handling
app.use(require('server/app/middlewares/errors'));

module.exports = app;
