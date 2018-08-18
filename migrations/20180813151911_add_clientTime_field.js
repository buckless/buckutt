exports.up = function (knex) {
    return knex.schema
        .table('accesses', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        })
        .table('withdrawals', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
        })
        .table('purchases', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            t.dateTime('clientDeletion').nullable();
        })
        .table('refunds', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            t.dateTime('clientDeletion').nullable();
        })
        .table('reloads', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            t.dateTime('clientDeletion').nullable();
        })
        .table('transfers', (t) => {
            t.dateTime('clientTime').notNullable().defaultTo(knex.raw('CURRENT_TIMESTAMP'));
            t.dateTime('clientDeletion').nullable();
        })
        .then(() => knex('accesses').update('clientTime', knex.raw('created_at')))
        .then(() => knex('withdrawals').update('clientTime', knex.raw('created_at')))
        .then(() => knex('purchases').update('clientTime', knex.raw('created_at')))
        .then(() => knex('purchases').update('clientDeletion', knex.raw('deleted_at')))
        .then(() => knex('refunds').update('clientTime', knex.raw('created_at')))
        .then(() => knex('refunds').update('clientDeletion', knex.raw('deleted_at')))
        .then(() => knex('reloads').update('clientTime', knex.raw('created_at')))
        .then(() => knex('reloads').update('clientDeletion', knex.raw('deleted_at')))
        .then(() => knex('transfers').update('clientTime', knex.raw('created_at')))
        .then(() => knex('transfers').update('clientDeletion', knex.raw('deleted_at')));
};

exports.down = function (knex) {
    return knex.schema
        .table('accesses', (t) => {
            t.dropColumn('clientTime');
        })
        .table('purchases', (t) => {
            t.dropColumn('clientTime');
        })
        .table('refunds', (t) => {
            t.dropColumn('clientTime');
        })
        .table('reloads', (t) => {
            t.dropColumn('clientTime');
        })
        .table('withdrawals', (t) => {
            t.dropColumn('clientTime');
        })
        .table('transfers', (t) => {
            t.dropColumn('clientTime');
        });
};
