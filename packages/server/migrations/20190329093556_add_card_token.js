exports.up = function(knex) {
    return knex.schema.table('transactions', t => {
        t.string('cardToken').nullable();
    });
};

exports.down = function(knex) {
    return knex.schema.table('transactions', t => {
        t.dropColumn('cardToken');
    });
};
