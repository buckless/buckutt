const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const cors = require('cors');
const bodyParser = require('body-parser-with-msgpack');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const express = require('express');
const http = require('http');
const randomstring = require('randomstring');
const config = require('../config');
const controllers = require('./controllers');
const purchaseWebservices = require('./lib/purchaseWebservices');
const logger = require('./lib/log');
const bookshelf = require('./lib/bookshelf');
const redis = require('./lib/redis');
const exposeResBody = require('./lib/exposeResBody');
const APIError = require('./errors/APIError');

const log = logger(module);

const app = express();

app.locals.config = config;
app.locals.models = bookshelf.models;

/**
 * Middlewares
 */
app.use(
    cors({
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Fingerprint', 'Idempotency-Key'],
        credentials: true,
        exposedHeaders: ['device', 'point', 'pointName', 'event', 'eventName', 'wiket'],
        origin: true
    })
);
app.use(bodyParser.msgpack({ limit: '5mb' }));
app.use(bodyParser.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(
    compression({
        // do not compress event-source request, non supported by browsers
        filter: req => req.path.indexOf('/live') === -1
    })
);
app.use(exposeResBody);

/**
 * Routes
 */
app.use(controllers);

/**
 * Error handling
 */
// 404
app.use((req, res, next) => {
    next(new APIError(module, 404, 'Not Found'));
});

// Internal error
app.use((err, req, res, next) => {
    let error = err;

    /* istanbul ignore next */
    if (!(err instanceof APIError)) {
        try {
            logger(err.stack.split('\n')[1]).error(err.stack, req.details);
        } catch (e) {
            log.error(err, req.details);
        }

        error = new APIError(module, 500, 'Unknown error');
    } else {
        if (err.details) {
            if (!req.details) {
                req.details = {};
            }

            // test req details
            req.details.error = err.details;
        }

        logger(err.module).error(err.message, req.details);
    }

    if (req.details.sse) {
        return;
    }

    res
        .status(error.status || 500)
        .send(error.toJSON())
        .end();
});

app.start = async () => {
    // todo : promise.all
    // todo : abort on catch
    await Promise.all([
        bookshelf.waitForDb(2, 15).then(() => bookshelf.sync()),
        redis.waitForCache(2, 15)
    ]); // 15 retries, one every 2 seconds

    const databaseSeeded = await checkSeeds();

    if (!databaseSeeded) {
        log.info('Seeding database...');

        await bookshelf.knex.seed.run();
    }

    const server = http.createServer(app);

    app.locals.pub = await redis.getClient().duplicate();
    app.locals.sub = await redis.getClient().duplicate();
    app.locals.server = server;

    // app.locals.sub.subscribe('userCreditUpdate');
    app.locals.sub.subscribe('data');

    purchaseWebservices(app);

    return new Promise((resolve, reject) => {
        server.listen(config.http.port, config.http.host, err => {
            /* istanbul ignore if */
            if (err) {
                return reject(err);
            }

            log.info('Server is listening http://%s:%d', config.http.host, config.http.port);

            resolve(app);

            if (process.send && typeof process.send === 'function') {
                process.send('ready');
            }
        });
    });
};

const checkSeeds = () =>
    app.locals.models.Device.where({ fingerprint: 'admin' })
        .count()
        .then(c => c === 0)
        .catch(() => false);

process.on('SIGINT', () => {
    bookshelf.knex
        .destroy()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
});

module.exports = app;

// Start the application
/* istanbul ignore if */
if (require.main === module) {
    app.start().catch(err => {
        log.error('Start error: %s', err);
    });
}
