const { embedParser, embedFilter } = require('server/app/utils/embedParser');

module.exports = async (ctx, walletId) => {
    const now = new Date();

    const embedMemberships = [
        { embed: 'user', required: true },
        { embed: 'period', filters: [['end', '>', now]], required: true },
        {
            embed: 'user.wallets',
            filters: [['blocked', '=', false], ['logical_id', '=', walletId]],
            required: true
        }
    ];

    const embedMembershipsFilters = embedMemberships
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    let memberships = await ctx.models.Membership.where(
        'group_id',
        '!=',
        ctx.event.defaultGroup_id
    ).fetchAll({ withRelated: embedParser(embedMemberships) });

    memberships = embedFilter(embedMembershipsFilters, memberships.toJSON());

    const accesses = [];

    for (let i = memberships.length - 1; i >= 0; i -= 1) {
        if (memberships[i].user.wallets.length > 0) {
            accesses.push({
                group: memberships[i].group_id,
                start: memberships[i].period.start,
                end: memberships[i].period.end
            });
        }
    }

    return accesses;
};
