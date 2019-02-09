exports.up = function(knex) {
    return knex.schema.createTable('withdrawals', t => {
        t.uuid('id').primary();
        t.timestamps(false, true);
        t.dateTime('deleted_at').nullable();
        t.boolean('active').nullable();

        t.integer('cateringId').notNullable();
        t.string('name').notNullable();

        t.uuid('point_id').references('points.id');
        t.uuid('buyer_id').references('users.id');
        t.uuid('seller_id').references('users.id');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTable('withdrawals');
};
