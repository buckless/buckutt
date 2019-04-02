exports.up = function(knex) {
    return knex.schema.table('events', t => {
        t.integer('fixedCostsReload')
            .notNullable()
            .unsigned()
            .defaultTo(0);
        t.float('variableCostsReload')
            .notNullable()
            .unsigned()
            .defaultTo(0);
        t.integer('fixedCostsRefund')
            .notNullable()
            .unsigned()
            .defaultTo(0);
        t.float('variableCostsRefund')
            .notNullable()
            .unsigned()
            .defaultTo(0);
    });
};

exports.down = function(knex) {
    return knex.schema.table('events', t => {
        t.dropColumn('fixedCostsReload');
        t.dropColumn('variableCostsReload');
        t.dropColumn('fixedCostsRefund');
        t.dropColumn('variableCostsRefund');
    });
};
