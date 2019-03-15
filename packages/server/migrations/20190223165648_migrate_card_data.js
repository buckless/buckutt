const uuidv4 = require('uuid/v4');

exports.up = function(knex) {
    return knex
        .select('users.id as user_id', 'users.credit', 'meansoflogin.*')
        .from('users')
        .leftJoin('meansoflogin', qb => {
            qb.on('users.id', 'meansoflogin.user_id');
            qb.onIn('meansoflogin.type', ['cardId']);
        })
        .then(results =>
            Promise.all(
                results.map(row => {
                    const walletId = uuidv4();
                    return knex('wallets')
                        .insert({
                            id: walletId,
                            active: row.active || true,
                            logical_id: row.data || uuidv4(),
                            physical_id: row.physical_id,
                            blocked: row.blocked || false,
                            credit: row.credit,
                            created_at: row.created_at || new Date(),
                            updated_at: row.updated_at || new Date(),
                            deleted_at: row.deleted_at,
                            user_id: row.user_id,
                            clientTime: row.clientTime || new Date()
                        })
                        .then(() => Promise.all([
                            knex('accesses')
                                .where('meanOfLogin_id', row.id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('transactions')
                                .where('user_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('pendingCardUpdates')
                                .where('user_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('purchases')
                                .where('buyer_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('reloads')
                                .where('buyer_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('refunds')
                                .where('buyer_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('withdrawals')
                                .where('buyer_id', row.user_id)
                                .update({
                                    wallet_id: walletId
                                }),
                            knex('transfers')
                                .where('sender_id', row.user_id)
                                .update({
                                    debitor_id: walletId
                                }),
                            knex('transfers')
                                .where('reciever_id', row.user_id)
                                .update({
                                    creditor_id: walletId
                                })
                        ]))
                })
            )
        );
};

exports.down = function(knex) {
    return knex('wallets')
        .then(results =>
            Promise.all(
                results.map(row => {
                    const meanOfLoginId = uuidv4();
                    return knex('meansoflogin')
                        .insert({
                            id: meanOfLoginId,
                            type: 'cardId',
                            active: row.active,
                            data: row.logical_id,
                            physical_id: row.physical_id,
                            blocked: row.blocked,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            deleted_at: row.deleted_at,
                            user_id: row.user_id,
                            clientTime: row.clientTime
                        })
                        .then(() => Promise.all([
                            knex('users')
                                .where('id', row.user_id)
                                .increment('credit', row.credit),
                            knex('accesses')
                                .where('wallet_id', row.id)
                                .update({
                                    meanOfLogin_id: meanOfLoginId
                                }),
                            knex('pendingCardUpdates')
                                .where('wallet_id', row.id)
                                .update({
                                    user_id: row.user_id
                                }),
                            knex('purchases')
                                .where('wallet_id', row.id)
                                .update({
                                    buyer_id: row.user_id
                                }),
                            knex('reloads')
                                .where('wallet_id', row.id)
                                .update({
                                    buyer_id: row.user_id
                                }),
                            knex('refunds')
                                .where('wallet_id', row.id)
                                .update({
                                    buyer_id: row.user_id
                                }),
                            knex('withdrawals')
                                .where('wallet_id', row.id)
                                .update({
                                    buyer_id: row.user_id
                                }),
                            knex('transfers')
                                .where('debitor_id', row.id)
                                .update({
                                    sender_id: row.user_id
                                }),
                            knex('transfers')
                                .where('creditor_id', row.id)
                                .update({
                                    reciever_id: row.user_id
                                }),
                            knex('memberships')
                                .where('wallet_id', row.id)
                                .update({
                                    user_id: row.user_id
                                })
                        ])
                    );
                })
            )
        )
        .then(() => knex('users'))
        .then(results =>
            Promise.all(
                results.map(row =>
                    knex('meansoflogin')
                        .insert({
                            id: uuidv4(),
                            type: 'mail',
                            active: true,
                            data: row.mail,
                            created_at: new Date(),
                            updated_at: new Date(),
                            user_id: row.id,
                            clientTime: new Date()
                        })
                )
            )
        );
};
