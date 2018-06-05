const fs = require('fs');
const path = require('path');
const log = require('./lib/log')(module);
const middlewares = require('./middlewares');
const { marshal, unmarshal } = require('./middlewares/connectors/socket');

const controllers = fs
    .readdirSync(path.join(__dirname, 'controllers/live'))
    .filter(f => f.slice(-3) === '.js')
    .map(f => require(path.join(__dirname, 'controllers', 'live', f)));

/**
 * Start a socketio server on an express instance
 * @param {HTTPServer} httpServer The node std http server
 * @param {Express}    app        The express instance
 */
module.exports.ioServer = (httpServer, app) => {
    const io = require('socket.io')(httpServer, {
        serveClient: false,
        engine: 'uws',
        handlePreflightRequest: false,
        pingInterval: 10000,
        pingTimeout: 5000
    });

    app.locals.io = io;

    const clients = {};

    // Setup all controllers
    controllers.forEach(controller => controller.setup(app, clients));

    io.on('connection', client => {
        const socket = client;
        client.emit('connected');

        if (process.env.SERVER_PROTOCOL === 'http') {
            client.fingerprint = socket.client.request.headers['x-certificate-fingerprint'];
        } else if (socket.client.request.connection.getPeerCertificate().fingerprint) {
            client.fingerprint = socket.client.request.connection
                .getPeerCertificate()
                .fingerprint.replace(/:/g, '')
                .trim();
        } else {
            return;
        }

        controllers.forEach(controller => {
            client.on(controller.route, (...args) => {
                let initialPromise = Promise.resolve();

                // Make client go through middlewares
                for (const key of Object.keys(middlewares)) {
                    // Skip 5_idempotency which is http only
                    if (key === '5') {
                        continue;
                    }

                    initialPromise = initialPromise
                        .then(() => marshal(middlewares[key])(controller.route, client, app))
                        .then(result => {
                            if (result.err) {
                                return Promise.reject(result.err);
                            }

                            return unmarshal(socket);
                        });
                }

                initialPromise = initialPromise
                    .then(() => {
                        const user = socket.user;

                        clients[client.id] = { client, user };

                        try {
                            controller.client(clients, client, ...args);
                        } catch (e) {
                            log.error(e.stack || e, client.details);
                        }

                        client.on('disconnect', () => {
                            delete clients[client.id];
                        });
                    })
                    .catch(err => {
                        client.emit('APIError', err.message);
                        log.warn('socket error:', err.message);
                    });
            });
        });
    });

    io.on('error', err => {
        /* istanbul ignore next */
        log.error(err);
    });
};
