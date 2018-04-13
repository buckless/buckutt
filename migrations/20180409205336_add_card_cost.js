exports.up = function (knex) {
    return knex.schema
        .table('transactions', (t) => {
            t.boolean('includeCard').notNullable().defaultTo(false);
        })
        .table('users', (t) => {
            t.boolean('hasPaidCard').notNullable().defaultTo(false);
            t.boolean('hasPaidInitialCard').notNullable().defaultTo(false);
        })
        .table('events', (t) => {
            t.integer('cardCost').notNullable().defaultTo(0);
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('transactions', (t) => {
            t.dropColumn('includeCard');
        })
        .table('users', (t) => {
            t.dropColumn('hasPaidCard');
            t.dropColumn('hasInitialPaidCard');
        })
        .table('events', (t) => {
            t.dropColumn('cardCost');
        });
};
