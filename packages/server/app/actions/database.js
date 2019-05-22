const bookshelf = require('server/app/db');
const { Client } = require('pg');
const config = require('server/app/config');

module.exports = {
    async erase(ctx) {
        const client = new Client({
            user: config.db.connection.user,
            host: config.db.connection.host,
            database: 'postgres',
            password: config.db.connection.password
        });

        await client.connect();

        const timestamp = new Date()
            .toISOString()
            .replace(/[-:\.T]/g, '_') // eslint-disable-line no-useless-escape
            .replace('Z', '');

        await client.query(
            `select pg_terminate_backend(pid) from pg_stat_activity where datname = '${config.db.connection.database}'`
        );
        await client.query(`alter database ${config.db.connection.database} rename to ${config.db.connection.database}_erased_${timestamp}`);
        await client.query(`create database ${config.db.connection.database}`);

        ctx.pub.publish('database-reconnect', JSON.stringify('reconnect'));
        await bookshelf.ready();

        await bookshelf.knex.migrate.latest();
        await bookshelf.knex.seed.run();
    }
};
