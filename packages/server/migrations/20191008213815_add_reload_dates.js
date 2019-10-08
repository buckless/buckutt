exports.up = function(knex) {
    return knex.schema.table('events', t => {
        t.dateTime('accountReloadStart').nullable();
        t.dateTime('accountReloadEnd').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('events', t => {
        t.dropColumn('accountReloadStart');
        t.dropColumn('accountReloadEnd');
    });
};
