const { embedParser, embedFilter } = require('./embedParser');
const fetchFromAPI = require('../ticketProviders');
const APIError = require('../errors/APIError');

module.exports = (models, ticketNumber) => {
    const MeanOfLogin = models.MeanOfLogin;
    const now = new Date();

    const embedMeanOfLogin = [
        {
            embed: 'user',
            required: true
        },
        {
            embed: 'user.meansOfLogin',
            filters: [['blocked', '=', false], ['type', '=', 'username']]
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

    return MeanOfLogin.where('type', 'in', ['ticketId', 'username', 'mail'])
        .where({
            data: ticketNumber,
            blocked: false
        })
        .fetch({
            withRelated: embedParser(embedMeanOfLogin)
        })
        .then(mol => {
            const mols = mol ? [mol.toJSON()] : [];
            return embedFilter(embedMeanOfLoginFilters, mols);
        })
        .then(mols => {
            if (mols.length > 0) {
                const mol = mols[0];

                return {
                    id: mol.user.id,
                    credit: mol.user.credit,
                    name: `${mol.user.firstname} ${mol.user.lastname}`,
                    currentGroups: mol.user.memberships.map(membership => ({
                        id: membership.group_id
                    })),
                    username: (mol.user.meansOfLogin[0] || {}).data
                };
            }

            return fetchFromAPI(ticketNumber).then(userData => {
                if (!userData) {
                    const err = new APIError(module, 404, "Couldn't find ticket", ticketNumber);
                    return Promise.reject(err);
                }

                return userData;
            });
        });
};
