const { fetchTicket } = require('@/providers/ticket');
const { embedParser, embedFilter } = require('@/utils/embedParser');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, ticketNumber) => {
    const MeanOfLogin = ctx.models.MeanOfLogin;
    const now = new Date();

    const embedMeanOfLogin = [
        { embed: 'user', required: true },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username']]
        },
        { embed: 'user.memberships' },
        {
            embed: 'user.memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        }
    ];

    const embedMeanOfLoginFilters = embedMeanOfLogin
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    const userData = await fetchTicket(ticketNumber);
    const ticketId = userData ? userData.ticketId : ticketNumber;

    const apiData = await MeanOfLogin.where('type', 'in', ['ticketId', 'username', 'mail'])
        .query({ where: { data: ticketId }, orWhere: { physical_id: ticketId } })
        .where({ blocked: false })
        .fetch({ withRelated: embedParser(embedMeanOfLogin) })
        .then(mol => {
            const mols = mol ? [mol.toJSON()] : [];

            return embedFilter(embedMeanOfLoginFilters, mols);
        });

    if (apiData.length > 0) {
        const mol = apiData[0];

        return {
            id: mol.user.id,
            credit: mol.user.credit,
            name: `${mol.user.firstname} ${mol.user.lastname}`,
            currentGroups: mol.user.memberships.map(membership => ({
                id: membership.group_id
            })),
            username: (mol.user.meansOfLogin[0] || {}).data
        };
    } else if (userData) {
        return userData;
    }

    throw new APIError(module, 404, "Couldn't find ticket", ticketNumber);
};
