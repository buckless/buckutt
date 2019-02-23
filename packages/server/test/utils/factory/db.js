const db = require('server/app/db');

module.exports = async ctx => {
    await db.ready();

    const databaseSeeded = await db.models.Group.where({ name: 'Défaut' })
        .count()
        .then(c => c === '1')
        .catch(() => false);

    if (!databaseSeeded) {
        await db.bookshelf.knex.seed.run();
    }

    // create default period, group and fundation
    ctx.defaultGroup = (await db.models.Group.where({ name: 'Défaut' }).fetch()).toJSON();
    ctx.defaultPeriod = (await db.models.Period.where({ name: 'Défaut' }).fetch()).toJSON();

    return db;
};
