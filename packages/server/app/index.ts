import { createServer } from 'http';
import { promisify } from 'util';
const config = require('server/app/config');
const bookshelf = require('server/app/db');
const redis = require('server/app/cache');
const log = require('server/app/log')(module);

const checkSeeds = require('server/app/utils/checkSeeds');
const live = require('server/app/actions/live');
const ticketsProviders = require('server/app/providers/ticket');

const main = async () => {
    const app = require('server/app/server');

    app.locals.models = bookshelf.models;
    app.locals.config = config;

    await Promise.all([bookshelf.ready(), redis.ready()]);

    const databaseSeeded = await checkSeeds(app.locals);

    if (!databaseSeeded) {
        log.info('Seeding database...');

        await bookshelf.knex.seed.run();
    }

    const server = createServer(app);
    server.listen = promisify(server.listen).bind(server);
    app.locals.server = server;

    app.locals.pub = await redis.getClient().duplicate();
    app.locals.sub = await redis.getClient().duplicate();

    app.locals.sub.subscribe('walletCreditUpdate');
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
    ticketsProviders(app);

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
if (require.main === module) {
    main().catch(err => {
        console.error(err);
        process.exit(-1);
    });
}
