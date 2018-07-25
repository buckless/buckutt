exports.up = function (knex) {
    return knex.schema
        .table('articles', (t) => {
            t.dropColumn('stock');
            t.dropColumn('vat');
        });
};

exports.down = function (knex) {
    return knex.schema
        .table('articles', (t) => {
            t.integer('stock').notNullable().defaultTo(0);
            t.integer('vat').notNullable().defaultTo(0);
        });
};
