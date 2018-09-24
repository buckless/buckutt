const { embedParser, embedFilter } = require('./embedParser');
const fetchFromAPI = require('../ticketProviders');
const APIError = require('../errors/APIError');

module.exports = async (models, ticketNumber) => {
    const MeanOfLogin = models.MeanOfLogin;
    const now = new Date();

    const embedMeanOfLogin = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin'
        },
        {
            embed: 'user.memberships'
        },
        {
            embed: 'user.memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        }
    ];

    const embedMeanOfLoginFilters = embedMeanOfLogin
        .filter(rel => rel.required)
        .map(rel => rel.embed);

    const userData = await fetchFromAPI(ticketNumber);
    const ticketId = userData ? userData.ticketId : ticketNumber;

    const apiData = await MeanOfLogin.where('type', 'in', ['ticketId', 'username', 'mail'])
        .query({
            where: { data: ticketId },
            orWhere: { physical_id: ticketId }
        })
        .fetch({
            withRelated: embedParser(embedMeanOfLogin)
        })
        .then(mol => {
            const mols = mol ? [mol.toJSON()] : [];
            return embedFilter(embedMeanOfLoginFilters, mols);
        });

    if (apiData.length > 0) {
        const mol = apiData[0];
        const usernameMol = mol.user.meansOfLogin.find(uMol => uMol.type === 'username' && !uMol.blocked) || {};
        const ticketMol = mol.user.meansOfLogin.find(tMol => tMol.type === 'ticketId') || { blocked: false };

        if (!mol.blocked && !ticketMol.blocked) {
            return {
                id: mol.user.id,
                molId: ticketMol.id,
                ticketId: ticketMol.data,
                physicalId: ticketMol.physical_id,
                credit: mol.user.credit,
                name: `${mol.user.firstname} ${mol.user.lastname}`,
                currentGroups: mol.user.memberships.map(membership => ({
                    id: membership.group_id
                })),
                username: usernameMol.data
            };
        }
    } else if (userData) {
        return userData;
    }

    return Promise.reject(new APIError(module, 404, "Couldn't find ticket", ticketNumber));
};
