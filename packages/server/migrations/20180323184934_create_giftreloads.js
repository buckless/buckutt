exports.up = function(knex) {
    return knex.schema.createTable('giftreloads', t => {
        t.uuid('id').primary();
        t.timestamps(false, true);
        t.dateTime('deleted_at').nullable();
        t.boolean('active').nullable();

        t.integer('everyAmount').notNullable();
        t.integer('amount').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('giftreloads');
};
