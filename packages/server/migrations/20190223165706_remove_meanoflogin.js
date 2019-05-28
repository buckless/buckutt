exports.up = function(knex) {
    return knex.schema
        .table('accesses', t => {
            t.dropForeign('meanOfLogin_id');
            t.dropColumn('meanOfLogin_id');
        })
        .table('pendingCardUpdates', t => {
            t.dropForeign('user_id');
            t.dropColumn('user_id');
        })
        .table('purchases', t => {
            t.dropForeign('buyer_id');
            t.dropColumn('buyer_id');
        })
        .table('reloads', t => {
            t.dropForeign('buyer_id');
            t.dropColumn('buyer_id');
        })
        .table('refunds', t => {
            t.dropForeign('buyer_id');
            t.dropColumn('buyer_id');
        })
        .table('withdrawals', t => {
            t.dropForeign('buyer_id');
            t.dropColumn('buyer_id');
        })
        .table('transfers', t => {
            t.dropForeign('sender_id');
            t.dropForeign('reciever_id');
            t.dropColumn('sender_id');
            t.dropColumn('reciever_id');
        })
        .table('users', t => {
            t.dropColumn('credit');
        })
        .dropTable('meansoflogin');
};

exports.down = function(knex) {
    return knex.schema
        .createTable('meansoflogin', t => {
            t.uuid('id').primary();
            t.timestamps(false, true);
            t.dateTime('deleted_at').nullable();
            t.boolean('active').nullable();

            t.string('type').notNullable();
            t.string('data').notNullable();
            t.string('physical_id').nullable();
            t.boolean('blocked')
                .notNullable()
                .defaultTo(false);

            t.dateTime('clientTime')
                .notNullable()
                .defaultTo(knex.raw('CURRENT_TIMESTAMP'));

            t.uuid('user_id').references('users.id');
        })
        .table('users', t => {
            t.integer('credit')
                .notNullable()
                .defaultTo(0);
        })
        .table('accesses', t => {
            t.uuid('meanOfLogin_id').references('meansoflogin.id');
        })
        .table('pendingCardUpdates', t => {
            t.uuid('user_id').references('users.id');
        })
        .table('purchases', t => {
            t.uuid('buyer_id').references('users.id');
        })
        .table('reloads', t => {
            t.uuid('buyer_id').references('users.id');
        })
        .table('refunds', t => {
            t.uuid('buyer_id').references('users.id');
        })
        .table('withdrawals', t => {
            t.uuid('buyer_id').references('users.id');
        })
        .table('transfers', t => {
            t.uuid('sender_id').references('users.id');
            t.uuid('reciever_id').references('users.id');
        })
        .then(() =>
            knex.raw('CREATE INDEX meansoflogin_lower_case_data_index ON meansoflogin(lower(data))')
        )
        .then(() =>
            knex.raw(
                `CREATE UNIQUE INDEX meansoflogin_type_data_active_unique ON meansoflogin (type, data, active) WHERE type != 'mail'`
            )
        )
        .then(() =>
            knex.raw(
                `CREATE UNIQUE INDEX meansoflogin_unique_cardId_per_user_index ON meansoflogin (user_id) WHERE type = 'cardId' AND active = true AND blocked = false`
            )
        );
};
