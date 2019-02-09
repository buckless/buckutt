const moduleAlias = require('module-alias');

moduleAlias.addAlias('@', __dirname);

const http = require('http');
const { promisify } = require('util');
const config = require('@/config');
const bookshelf = require('@/db');
const redis = require('@/cache');
const log = require('@/log')(module);

const checkSeeds = require('@/utils/checkSeeds');
const live = require('@/actions/live');
const ticketsProviders = require('@/providers/ticket');

const main = async () => {
    const app = require('@/server');

    app.locals.models = bookshelf.models;
    app.locals.config = config;

    await Promise.all([bookshelf.ready(), redis.ready()]);

    const databaseSeeded = await checkSeeds(app.locals);

    if (!databaseSeeded) {
        log.info('Seeding database...');

        await bookshelf.knex.seed.run();
    }

    const server = http.createServer(app);
    server.listen = promisify(server.listen).bind(server);
    app.locals.server = server;

    app.locals.pub = await redis.getClient().duplicate();
    app.locals.sub = await redis.getClient().duplicate();

    app.locals.sub.subscribe('userCreditUpdate');
    app.locals.sub.subscribe('data');
    app.locals.sub.subscribe('alert');
    app.locals.sub.subscribe('database-reconnect');

    // reconnect to db if a service asks for it
    app.locals.sub.on('message', channel => {
        if (channel === 'database-reconnect') {
            // add a setTimeout so that the emitter thread (who is already restarting connection)
            // does not reconnect again
            setTimeout(() => bookshelf.ready(), 100);
        }
    });

    // setup event emitters and redis
    live.setup(app);
    // setup ticket providers jobs
    ticketsProviders.setup();

    await server.listen(config.http.port, config.http.host);

    log.info('Server is listening http://%s:%d', config.http.host, config.http.port);

    // notify pm2 ready
    if (process.send && typeof process.send === 'function') {
        process.send('ready');
    }

    // clear database on exit
    process.on('SIGINT', () => {
        bookshelf.knex
            .destroy()
            .then(() => process.exit(0))
            .catch(() => process.exit(1));
    });

    return app;
};

module.exports = main;

// Start the application
/* istanbul ignore if */
if (require.main === module) {
    main().catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(-1);
    });
}
