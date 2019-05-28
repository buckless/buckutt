exports.up = function(knex) {
    return knex.schema
        .table('purchases', t => {
            t.integer('amount').notNullable().defaultTo(0);
        })
        .table('prices', t => {
            t.boolean('freePrice').notNullable().defaultTo(false);
        })
        .then(() => knex
            .select('purchases.id', 'prices.amount')
            .from('purchases')
            .leftJoin('prices', 'prices.id', 'purchases.price_id')
        )
        .then(results =>
            Promise.all(
                results.map(row =>
                    knex('purchases')
                    .where('id', row.id)
                    .update({
                        amount: row.amount
                    })
                )
            )
        );
};

exports.down = function(knex) {
    return knex.schema
        .table('purchases', t => {
            t.dropColumn('amount');
        })
        .table('prices', t => {
            t.dropColumn('freePrice');
        });
};
