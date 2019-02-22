exports.up = function (knex) {
    return knex.schema.createTable('invoiceNumbers', t => {
        t.uuid('id').primary();
        t.timestamps(false, true);
        t.dateTime('deleted_at').nullable();
        t.boolean('active').nullable();

        t.string('invoiceNumber').notNullable();
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('invoiceNumbers');
};
