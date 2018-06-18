exports.up = function (knex) {
    return knex.schema
        .createTable('physicalsupports', (t) => {
            t.uuid('id').primary();
            t.string('logical_id').notNullable();
            t.string('physical_id').notNullable();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();
        })
        .table('meansoflogin', (t) => {
            t.string('physical_id').nullable();
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('physicalsupports')
        .table('meansoflogin', (t) => {
            t.dropColumn('physical_id');
        });
};
