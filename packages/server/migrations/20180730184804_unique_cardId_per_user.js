exports.up = function(knex) {
    return knex.raw(
        `CREATE UNIQUE INDEX meansoflogin_unique_cardId_per_user_index ON meansoflogin (user_id) WHERE type = 'cardId' AND active = true AND blocked = false`
    );
};

exports.down = function(knex) {
    return knex.schema.table('meansoflogin', t => {
        t.dropIndex('unique_cardId_per_user');
    });
};
