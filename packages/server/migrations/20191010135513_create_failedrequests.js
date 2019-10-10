exports.up = function(knex) {
    return knex.schema.createTable('failedRequests', t => {
        t.uuid('id').primary();
        t.timestamps(false, true);
        t.dateTime('deleted_at').nullable();
        t.boolean('active').nullable();

        t.json('data').notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('failedRequests');
};
