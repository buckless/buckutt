const app = require('../../src/app');
const bookshelf = require('../../src/lib/bookshelf');

let testsInit = false;

module.exports = () => {
    if (testsInit) {
        return Promise.resolve();
    }

    testsInit = true;

    return bookshelf
        .sync()
        .then(() => bookshelf.knex('periods').count())
        .then(count => (count === 0 ? bookshelf.knex.seed.run() : Promise.resolve()))
        .then(() => app.start())
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
};
