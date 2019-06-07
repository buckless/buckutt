exports.up = function(knex) {
    return knex.schema.table('meansofpayment', t => {
        t.string('type')
            .notNullable()
            .default('numeric');
    });
};

exports.down = function(knex) {
    return knex.schema.table('meansofpayment', t => {
        t.dropColumn('type');
    });
};
