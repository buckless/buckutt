const { knex } = require('server/app/db').bookshelf;
const { embedParser, embedFilter } = require('server/app/utils/embedParser');
const leven = require('leven');

const searchuser = async (ctx, { name, max, userRights }) => {
    const now = new Date();

    const embedUsers = [
        {
            embed: 'meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username']]
        },
        {
            embed: 'memberships'
        },
        {
            embed: 'memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
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
            mail: userRights.assign ? user.mail : undefined,
            credit: userRights.assign ? user.credit : undefined,
            currentGroups: userRights.assign
                ? user.memberships.map(membership => ({ id: membership.group_id }))
                : undefined,
            username: (user.meansOfLogin[0] || {}).data
        }))
        .sort((a, b) => {
            const aName = `${a.firstname} ${a.lastname}`;
            const bName = `${b.firstname} ${b.lastname}`;

            return leven(name, bName) - leven(name, aName);
        });
};

module.exports = {
    searchuser
};
