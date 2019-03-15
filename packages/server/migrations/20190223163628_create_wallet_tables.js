exports.up = function(knex) {
    return knex.schema
        .createTable('wallets', t => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();

            t.integer('credit')
                .notNullable()
                .defaultTo(0);
            t.string('logical_id').nullable();
            t.string('physical_id').nullable();
            t.boolean('blocked')
                .notNullable()
                .defaultTo(false);

            t.dateTime('clientTime')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

            t.uuid('user_id').references('users.id');
        })
        .createTable('tickets', t => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();

            t.string('logical_id').notNullable();
            t.string('physical_id').nullable();

            t.integer('amount')
                .notNullable()
                .defaultTo(0);

            t.dateTime('clientTime')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

            t.string('firstname').notNullable();
            t.string('lastname').notNullable();
            t.string('mail').notNullable();

            t.unique(['logical_id', 'active'], 'unique_logical');

            t.uuid('wallet_id').references('wallets.id');
        })
        .table('accesses', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('transactions', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('pendingCardUpdates', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('purchases', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('reloads', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('withdrawals', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('refunds', t => {
            t.uuid('wallet_id').references('wallets.id');
        })
        .table('transfers', t => {
            t.uuid('creditor_id').references('wallets.id');
            t.uuid('debitor_id').references('wallets.id');
        })
        .table('memberships', t => {
            t.uuid('wallet_id').references('wallets.id');
        });
};

exports.down = function(knex) {
    return knex.schema
        .table('memberships', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('transfers', t => {
            t.dropForeign('creditor_id');
            t.dropForeign('debitor_id');
            t.dropColumn('creditor_id');
            t.dropColumn('debitor_id');
        })
        .table('refunds', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('withdrawals', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('reloads', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('purchases', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('pendingCardUpdates', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('transactions', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .table('accesses', t => {
            t.dropForeign('wallet_id');
            t.dropColumn('wallet_id');
        })
        .dropTable('tickets')
        .dropTable('wallets');
};
