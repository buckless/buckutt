exports.up = function(knex) {
    return knex.schema.table('refunds', t => {
        t.boolean('isCancellation').default(false);
        t.uuid('point_id').references('points.id');
    });
};

exports.down = function(knex) {
    return knex.schema.table('refunds', t => {
        t.dropColumn('isCancellation');
        t.dropForeign('point_id');
        t.dropColumn('point_id');
    });
};
