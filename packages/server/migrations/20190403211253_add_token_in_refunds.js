exports.up = function(knex) {
    return knex.schema
        .table('transactions', t => {
            t.string('cardExpiration').nullable();
            t.string('cardType').nullable();
            t.boolean('isAuthorization').default(false);
        })
        .table('refunds', t => {
            t.boolean('sentToProvider').default(false);
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('transactions', t => {
            t.dropColumn('cardExpiration');
            t.dropColumn('cardType');
            t.dropColumn('isAuthorization');
        })
        .table('refunds', t => {
            t.dropColumn('sentToProvider');
        });
};
