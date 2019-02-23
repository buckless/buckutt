const { bookshelf } = require('server/app/db');

module.exports = async (_, { user_id }) => {
    await bookshelf
        .knex('meansoflogin')
        .where({ user_id, type: 'cardId' })
        .update({ blocked: true, updated_at: new Date() });
};
