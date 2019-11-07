exports.up = function(knex) {
    return knex.schema
        .createTable('coupons', t => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();

            t.string('name').notNullable();
            t.integer('maxNumber')
                .notNullable()
                .unsigned()
                .defaultTo(1);
            t.dateTime('start').nullable();
            t.dateTime('end').nullable();

            t.uuid('set_id').references('sets.id');

            t.unique(['name', 'active']);
        })
        .table('withdrawals', t => {
            t.boolean('isCancellation').default(false);
            t.uuid('coupon_id').references('coupons.id');
            t.uuid('article_id').references('articles.id');
            t.dropColumn('name');
            t.dropColumn('cateringId');
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('withdrawals', t => {
            t.dropForeign('coupon_id');
            t.dropColumn('coupon_id');
            t.dropForeign('article_id');
            t.dropColumn('article_id');
            t.dropColumn('isCancellation');
            t.integer('cateringId').notNullable();
            t.string('name').notNullable();
        })
        .dropTable('coupons');
};
