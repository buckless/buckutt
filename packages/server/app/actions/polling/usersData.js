const { embedParser, embedFilter } = require('server/app/utils/embedParser');
const { bookshelf } = require('server/app/db');

module.exports = async (ctx, { now, lastUpdate }) => {
    const useCardData = ctx.event.useCardData;
    const accesses = { insert: [], delete: [] };
    const tickets = { insert: [], delete: [] };
    const pendingCardUpdates = { insert: [], delete: [] };

    // If we don't use card data, everything is working online, don't send offline needed data
    if (!useCardData) {
        return {
            blockedCards: [],
            accesses,
            tickets,
            pendingCardUpdates
        };
    }

    // step 1: get currently blocked cards uids
    const blockedCards = await ctx.models.Wallet.where({ blocked: true })
        .fetchAll()
        .then(blockedCards_ => blockedCards_.toJSON().map(blockedCard => blockedCard.logical_id));

    // step 2: get accesses new and removed inserts
    const embedMemberships = [
        { embed: 'wallet' },
        { embed: 'user' },
        { embed: 'user.wallets' },
        {
            embed: 'period',
            filters: [['end', '>', now]],
            required: true
        }
    ];

    const embedMembershipsFilters = embedMemberships
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    // return the membership if it has been recently updated or modified, or if its related users (or cards) has been updated of modified
    const memberships = await ctx.models.Membership.where(
        'group_id',
        '!=',
        ctx.event.defaultGroup_id
    )
        .andWhere(q => {
            q.where('deleted_at', '>=', lastUpdate);
            q.orWhere('updated_at', '>=', lastUpdate);
            q.orWhereHas('user', subQuery => {
                subQuery.where(nested => {
                    nested.where('deleted_at', '>=', lastUpdate);
                    nested.orWhere('updated_at', '>=', lastUpdate);
                    nested.orWhereHas('wallets', subSubQuery => {
                        subSubQuery.where(subNested => {
                            subNested.orWhere('deleted_at', '>=', lastUpdate);
                            subNested.orWhere('updated_at', '>=', lastUpdate);
                        });
                        subSubQuery.withDeleted();
                    });
                });
                subQuery.withDeleted();
            });
            q.orWhereHas('wallet', subQuery => {
                subQuery.where(nested => {
                    nested.where('deleted_at', '>=', lastUpdate);
                    nested.orWhere('updated_at', '>=', lastUpdate);
                });
                subQuery.withDeleted();
            });
        })
        .fetchAll({
            withRelated: embedParser(embedMemberships),
            withDeleted: true
        })
        .then(memberships => embedFilter(embedMembershipsFilters, memberships.toJSON()));

    for (let i = memberships.length - 1; i >= 0; i -= 1) {
        if (!memberships[i].user) {
            memberships[i].user = { wallets: [] };
        }

        if (memberships[i].wallet) {
            memberships[i].user.wallets.push(memberships[i].wallet);
        }

        for (let j = memberships[i].user.wallets.length - 1; j >= 0; j -= 1) {
            // notify deletion if the membership has been deleted, the wallet has been deleted or blocked
            if (
                memberships[i].deleted_at ||
                memberships[i].user.deleted_at ||
                memberships[i].user.wallets[j].deleted_at ||
                memberships[i].user.wallets[j].blocked
            ) {
                accesses.delete.push({
                    id: `${memberships[i].id}_${memberships[i].user.wallets[j].id}`
                });
                continue;
            }

            accesses.insert.push({
                id: `${memberships[i].id}_${memberships[i].user.wallets[j].id}`,
                walletId: memberships[i].user.wallets[j].id,
                cardId: memberships[i].user.wallets[j].logical_id,
                groupId: memberships[i].group_id,
                start: memberships[i].period.start,
                end: memberships[i].period.end
            });
        }
    }

    // step 3: get assignables tickets & wallets
    // step 3.1: get standalone tickets without a wallet
    const ticketsDb = await ctx.models.Ticket.where(q => {
        q.where('deleted_at', '>=', lastUpdate);
        q.orWhere('updated_at', '>=', lastUpdate);
    })
        .fetchAll({
            withDeleted: true
        })
        .then(ticketsDb => ticketsDb.toJSON());

    for (let i = ticketsDb.length - 1; i >= 0; i -= 1) {
        // Delete the ticket from the table when it has been already assigned to a wallet
        if (ticketsDb[i].deleted_at || ticketsDb[i].wallet_id) {
            tickets.delete.push({ id: ticketsDb[i].id });
            continue;
        }

        tickets.insert.push({
            id: ticketsDb[i].id,
            ticketId: ticketsDb[i].id,
            walletId: null,
            barcode: ticketsDb[i].logical_id,
            name: `${ticketsDb[i].firstname} ${ticketsDb[i].lastname}`,
            credit: ticketsDb[i].amount,
            physicalId: ticketsDb[i].physical_id,
            mail: ticketsDb[i].mail,
            validation: ticketsDb[i].validation
        });
    }

    // step 3.2: get user's related standalone wallets without a logicalId
    const embedWallets = [{ embed: 'user', required: true }, { embed: 'ticket' }];

    const embedWalletsFilters = embedWallets.filter(rel => rel.required).map(rel => rel.embed);

    const walletsDb = await ctx.models.Wallet.where(q => {
        q.where('deleted_at', '>=', lastUpdate);
        q.orWhere('updated_at', '>=', lastUpdate);
    })
        .whereNotNull('user_id')
        .fetchAll({
            withRelated: embedParser(embedWallets),
            withDeleted: true
        })
        .then(walletsDb => embedFilter(embedWalletsFilters, walletsDb.toJSON()));

    for (let i = walletsDb.length - 1; i >= 0; i -= 1) {
        if (walletsDb[i].deleted_at || walletsDb[i].logical_id || walletsDb[i].blocked) {
            tickets.delete.push({ id: walletsDb[i].id });
            continue;
        }

        tickets.insert.push({
            id: walletsDb[i].id,
            walletId: walletsDb[i].id,
            ticketId: walletsDb[i].ticket ? walletsDb[i].ticket.id : null,
            barcode: walletsDb[i].ticket ? walletsDb[i].ticket.logical_id : null,
            name: `${walletsDb[i].user.firstname} ${walletsDb[i].user.lastname}`,
            credit: walletsDb[i].credit,
            physicalId: walletsDb[i].ticket ? walletsDb[i].ticket.physical_id : null,
            mail: walletsDb[i].user.mail
        });
    }

    // step 4: get pendingCardUpdates new and removed inserts
    const pendingCardUpdates_ = await ctx.models.PendingCardUpdate.query(knex => {
        knex.select('pendingCardUpdates.*', 'wallets.logical_id', qb => {
            qb.count('*');
            qb.from('pendingCardUpdates as P');
            qb.where(
                'created_at',
                '<=',
                bookshelf.knex.raw('??', ['pendingCardUpdates.created_at'])
            );
            qb.andWhere(
                'wallet_id',
                '=',
                bookshelf.knex.raw('??', ['pendingCardUpdates.wallet_id'])
            );
            qb.as('incrId');
        });
        knex.leftJoin('wallets', qb => {
            qb.on('wallets.id', '=', 'pendingCardUpdates.wallet_id');
            qb.onIn('wallets.blocked', [false]);
            qb.onNull('wallets.deleted_at');
        });
        knex.whereNotNull('wallets.logical_id');
        knex.andWhere(subQuery => {
            subQuery.where('wallets.deleted_at', '>=', lastUpdate);
            subQuery.orWhere('wallets.updated_at', '>=', lastUpdate);
            subQuery.orWhere('pendingCardUpdates.deleted_at', '>=', lastUpdate);
            subQuery.orWhere('pendingCardUpdates.updated_at', '>=', lastUpdate);
        });
    })
        .fetchAll({ withDeleted: true })
        .then(pendingCardUpdates_ => pendingCardUpdates_.toJSON());

    for (let i = pendingCardUpdates_.length - 1; i >= 0; i -= 1) {
        if (pendingCardUpdates_[i].deleted_at || !pendingCardUpdates_[i].logical_id) {
            pendingCardUpdates.delete.push({ id: pendingCardUpdates_[i].id });
            continue;
        }

        pendingCardUpdates.insert.push({
            id: pendingCardUpdates_[i].id,
            incrId: pendingCardUpdates_[i].incrId,
            cardId: pendingCardUpdates_[i].logical_id,
            amount: pendingCardUpdates_[i].amount
        });
    }

    return {
        blockedCards,
        accesses,
        tickets,
        pendingCardUpdates
    };
};
