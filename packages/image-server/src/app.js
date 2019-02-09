const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const mkdirp = require('mkdirp');
const bodyParser = require('body-parser');
const config = require('../config');

const log = require('./lib/log')(module);
const imagesPath = require('./lib/imagesPath');
const controllers = require('./controllers');

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));

/**
 * Routes
 */
app.use(controllers);

/**
 * 404 Error
 */
app.use((req, res) => {
    res.status(404)
        .send({ error: 'NOT_FOUND' })
        .end();
});

/**
 * Internal Error
 */
/* istanbul ignore next */
app.use((err, _, res, __) => {
    log.error('Unkown error', err);

    res.status(err.status || 500)
        .send({ error: 'UNKNOWN_ERROR' })
        .end();
});

app.start = () =>
    new Promise(resolve => {
        const server = app.listen(config.http.port, config.http.host, () => {
            log.info('Server is listening %s:%d', config.http.host, config.http.port);

            // Keep server instance for closing it later
            app.server = server;

            // Avoid race condition on server starting before directory creation
            mkdirp(imagesPath, resolve);
        });
    });

app.stop = () => {
    const server = app.server;

    /* istanbul ignore if */
    if (!server) {
        return Promise.reject(new Error('server is not listening'));
    }

    const close = require('util').promisify(server.close.bind(server));

    return close();
};

module.exports = app;

/* istanbul ignore if */
if (require.main === module) {
    app.start().catch(err => log.error(err));
}
