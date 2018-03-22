exports.up = function (knex) {
    return knex.schema
        .createTable('accessess', (t) => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();

            t.uuid('meanOfLogin_id').references('meansoflogin.id');
            t.uuid('operator_id').references('users.id');
            t.uuid('wiket_id').references('wikets.id');
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('accessess');
};
