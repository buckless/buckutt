exports.up = function(knex) {
    return knex.schema
        .table('reloads', t => {
            t.boolean('isCancellation').default(false);
            t.dropColumn('clientDeletion');
        })
        .table('purchases', t => {
            t.boolean('isCancellation').default(false);
            t.dropColumn('clientDeletion');
        })
        .table('transfers', t => {
            t.dropColumn('clientDeletion');
        })
        .table('refunds', t => {
            t.dropColumn('clientDeletion');
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('reloads', t => {
            t.dropColumn('isCancellation');
            t.dateTime('clientDeletion').nullable();
        })
        .table('purchases', t => {
            t.dropColumn('isCancellation');
            t.dateTime('clientDeletion').nullable();
        })
        .table('transfers', t => {
            t.dateTime('clientDeletion').nullable();
        })
        .table('refunds', t => {
            t.dateTime('clientDeletion').nullable();
        });
};
