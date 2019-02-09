exports.up = function(knex) {
    return knex.schema.table('events', t => {
        t.dateTime('accountRefundStart').nullable();
        t.dateTime('accountRefundEnd').nullable();
        t.integer('minimumAccountRefund')
            .nullable()
            .defaultsTo(0);
    });
};

exports.down = function(knex) {
    return knex.schema.table('events', t => {
        t.dropColumn('accountRefundStart');
        t.dropColumn('accountRefundEnd');
        t.dropColumn('minimumAccountRefund');
    });
};
