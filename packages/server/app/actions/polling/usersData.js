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
    const blockedCards = await ctx.models.MeanOfLogin.where({ type: 'cardId', blocked: true })
        .fetchAll()
        .then(blockedCards_ => blockedCards_.toJSON().map(blockedCard => blockedCard.data));

    // step 2: get accesses new and removed inserts
    const embedMemberships = [
        { embed: 'user', required: true },
        {
            embed: 'user.meansOfLogin',
            filters: [['type', '=', 'cardId'], ['active', '=', true]],
            required: true
        },
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
                    nested.orWhereHas('meansOfLogin', subSubQuery => {
                        subSubQuery.where('type', '=', 'cardId');
                        subSubQuery.andWhere(subNested => {
                            subNested.orWhere('deleted_at', '>=', lastUpdate);
                            subNested.orWhere('updated_at', '>=', lastUpdate);
                        });
                        subSubQuery.withDeleted();
                    });
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
        // notify deletion if the membership has been deleted, the user has been deleted, the user has no card, the card has been deleted or blocked
        if (
            memberships[i].deleted_at ||
            memberships[i].user.deleted_at ||
            !memberships[i].user.meansOfLogin[0] ||
            memberships[i].user.meansOfLogin[0].deleted_at ||
            memberships[i].user.meansOfLogin[0].blocked
        ) {
            accesses.delete.push({ id: memberships[i].id });
            continue;
        }

        accesses.insert.push({
            id: memberships[i].id,
            userId: memberships[i].user_id,
            cardId: memberships[i].user.meansOfLogin[0].data,
            groupId: memberships[i].group_id,
            start: memberships[i].period.start,
            end: memberships[i].period.end
        });
    }

    // step 3: get tickets new and removed inserts
    const embedTickets = [
        { embed: 'user', required: true },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username'], ['active', '=', true]],
            required: true
        }
    ];

    const embedTicketsFilters = embedTickets.filter(rel => rel.required).map(rel => rel.embed);

    const ticketsMols = await ctx.models.MeanOfLogin.where('type', '=', 'ticketId')
        .andWhere(q => {
            q.where('deleted_at', '>=', lastUpdate);
            q.orWhere('updated_at', '>=', lastUpdate);
            q.orWhereHas('user', subQuery => {
                subQuery.where(nested => {
                    nested.where('updated_at', '>=', lastUpdate);
                    nested.orWhere('deleted_at', '>=', lastUpdate);
                });
                subQuery.withDeleted();
            });
        })
        .fetchAll({
            withRelated: embedParser(embedTickets),
            withDeleted: true
        })
        .then(ticketsMols => embedFilter(embedTicketsFilters, ticketsMols.toJSON()));

    for (let i = ticketsMols.length - 1; i >= 0; i -= 1) {
        if (ticketsMols[i].deleted_at || ticketsMols[i].blocked || ticketsMols[i].user.deleted_at) {
            tickets.delete.push({ id: ticketsMols[i].id });
            continue;
        }

        tickets.insert.push({
            id: ticketsMols[i].id,
            barcode: ticketsMols[i].data,
            userId: ticketsMols[i].user.id,
            name: `${ticketsMols[i].user.firstname} ${ticketsMols[i].user.lastname}`,
            username: (ticketsMols[i].user.meansOfLogin[0] || { data: '' }).data,
            credit: ticketsMols[i].user.credit,
            physicalId: ticketsMols[i].physical_id
        });
    }

    // step 4: get pendingCardUpdates new and removed inserts
    const pendingCardUpdates_ = await ctx.models.PendingCardUpdate.query(knex => {
        knex.select('pendingCardUpdates.*', 'meansoflogin.data', qb => {
            qb.count('*');
            qb.from('pendingCardUpdates as P');
            qb.where(
                'created_at',
                '<=',
                bookshelf.knex.raw('??', ['pendingCardUpdates.created_at'])
            );
            qb.andWhere('user_id', '=', bookshelf.knex.raw('??', ['pendingCardUpdates.user_id']));
            qb.as('incrId');
        });
        // Put the condition in the on statement to return an answer even if the user has no card
        knex.leftJoin('meansoflogin', qb => {
            qb.on('meansoflogin.user_id', '=', 'pendingCardUpdates.user_id');
            qb.onIn('meansoflogin.type', ['cardId']);
            qb.onIn('meansoflogin.blocked', [false]);
            qb.onNull('meansoflogin.deleted_at');
        });
        knex.andWhere(subQuery => {
            subQuery.where('meansoflogin.deleted_at', '>=', lastUpdate);
            subQuery.orWhere('meansoflogin.updated_at', '>=', lastUpdate);
            subQuery.orWhere('pendingCardUpdates.deleted_at', '>=', lastUpdate);
            subQuery.orWhere('pendingCardUpdates.updated_at', '>=', lastUpdate);
        });
    })
        .fetchAll({ withDeleted: true })
        .then(pendingCardUpdates_ => pendingCardUpdates_.toJSON());

    for (let i = pendingCardUpdates_.length - 1; i >= 0; i -= 1) {
        if (pendingCardUpdates_[i].deleted_at) {
            pendingCardUpdates.delete.push({ id: pendingCardUpdates_[i].id });
            continue;
        }

        pendingCardUpdates.insert.push({
            id: pendingCardUpdates_[i].id,
            incrId: pendingCardUpdates_[i].incrId,
            cardId: pendingCardUpdates_[i].data,
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
