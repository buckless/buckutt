const bookshelf = require('@/db');
const { Client } = require('pg');
const config = require('@/config');

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
            `select pg_terminate_backend(pid) from pg_stat_activity where datname = 'buckless'`
        );
        await client.query(`alter database buckless rename to buckless_erased_${timestamp}`);
        await client.query(`create database buckless`);

        ctx.pub.publish('database-reconnect', JSON.stringify('reconnect'));
        await bookshelf.ready();

        await bookshelf.knex.migrate.latest();
        await bookshelf.knex.seed.run();
    }
};
