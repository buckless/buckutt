exports.up = function (knex) {
    return knex.schema
        .table('periods', (t) => {
            t.dropForeign('event_id');
            t.dropColumn('event_id');
        })
        .table('alerts', (t) => {
            t.dropForeign('event_id');
            t.dropColumn('event_id');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('periods', (t) => {
            t.uuid('event_id').references('events.id');
        })
        .table('alerts', (t) => {
            t.uuid('event_id').references('events.id');
        });
};
