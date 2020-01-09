const { knex } = require('server/app/db').bookshelf;
const { embedParser, embedFilter } = require('server/app/utils/embedParser');
const leven = require('leven');

module.exports = async (ctx, { name, max, userRights }) => {
    const now = new Date();

    const embedUsers = [
        {
            embed: 'memberships'
        },
        {
            embed: 'memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        },
        {
            embed: 'wallets'
        }
    ];

    const embedUsersFilters = embedUsers.filter(rel => rel.required).map(rel => rel.embed);

    const users = await ctx.models.User.query(user => {
        let filter = user
            .where(
                knex.raw("concat(lower(firstname), ' ', lower(lastname))"),
                'like',
                `%${name.toLowerCase()}%`
            )
            .orderByRaw('LOWER(firstname) asc');

        if (max > 0) {
            filter = filter.limit(max);
        }

        return filter;
    })
        .fetchAll({ withRelated: embedParser(embedUsers) })
        .then(users => embedFilter(embedUsersFilters, users.toJSON()));

    return users
        .map(user => ({
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            wallets: user.wallets.map(wallet => ({
                ...wallet,
                credit: userRights.assign ? wallet.credit : undefined
            }))
        }))
        .sort((a, b) => {
            const aName = `${a.firstname} ${a.lastname}`;
            const bName = `${b.firstname} ${b.lastname}`;

            return leven(name, bName) - leven(name, aName);
        });
};
