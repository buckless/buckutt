const fs        = require('fs');
const path      = require('path');
const config    = require('../../config');
const logger    = require('./log');

const knex      = require('knex')(config.db);
const bookshelf = require('bookshelf')(knex);

const log = logger(module);

const modelsPath = path.join(__dirname, '..', 'models');
const models     = {};

bookshelf.plugin('registry');
bookshelf.plugin('virtuals');
bookshelf.plugin('pagination');
bookshelf.plugin(require('bookshelf-uuid'));
bookshelf.plugin(require('bookshelf-signals')());

bookshelf.plugin('bookshelf-manager', { root: modelsPath });
bookshelf.plugin(require('bookshelf-paranoia'), { field: 'deleted_at', sentinel: 'active' });

fs
    .readdirSync(modelsPath)
    .map((file) => {
        const { Model, name } = require(path.join(modelsPath, file))(bookshelf);

        models[name] = bookshelf.model(name, Model);
    });

function waitForDb(interval, retries) {
    let tries = 0;
    const tryConnect = (resolve, reject) => {
        log.info('Connection to database...');
        knex.raw('select 1 as result')
            .then(() => {
                log.info('Connected to database.');
                resolve();
            })
            .catch(() => {
                log.error(`Couldn't connect to database. Retrying in ${interval} seconds...`);

                tries += 1;
                if (tries === retries) {
                    return reject(new Error(`Database unavailable. Retried ${retries} times.`));
                }

                setTimeout(() => tryConnect(resolve, reject), interval * 1000);
            });
    };

    return new Promise(((resolve, reject) => {
        tryConnect(resolve, reject);
    }));
}

function sync() {
    return knex.migrate.latest();
}

module.exports = {
    knex,
    bookshelf,
    models,
    sync,
    waitForDb
};
