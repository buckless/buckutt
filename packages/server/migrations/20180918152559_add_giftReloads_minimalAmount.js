exports.up = function (knex) {
    return knex.schema.table('giftreloads', (t) => {
        t.integer('minimalAmount').notNullable().defaultTo(0);
    });
};

exports.down = function (knex) {
    return knex.schema.table('giftreloads', (t) => {
        t.dropColumn('minimalAmount');
    });
};
