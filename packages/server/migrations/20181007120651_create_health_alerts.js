exports.up = function (knex) {
    return knex.schema
        .createTable('healthAlerts', (t) => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            t.boolean('active').nullable();

            t.uuid('event_id').references('events.id');
            t.uuid('point_id').references('points.id');
            t.uuid('sender_id').references('users.id');
            t.string('location').notNullable();
            t.integer('people').notNullable().defaultTo(1);
            t.boolean('notAlcohol').notNullable().defaultTo(false);
            t.boolean('blood').notNullable().defaultTo(false);
            t.boolean('closedEyes').notNullable().defaultTo(false);
        });
};

exports.down = function (knex) {
    return knex.schema
        .dropTable('healthAlerts');
};
