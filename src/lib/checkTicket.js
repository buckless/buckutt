const APIError = require('../errors/APIError');

module.exports = (models, meansOfLogin) => {
    const ticket = meansOfLogin.find(mol => mol.type === 'ticketId');

    if (!ticket) {
        return Promise.resolve();
    }

    return models.MeanOfLogin.where({ type: 'ticketId', blocked: false, data: ticket.data })
        .fetch({
            withRelated: ['user']
        })
        .then(meanOfLogin => {
            if (!meanOfLogin) {
                return Promise.resolve();
            }

            return Promise.reject(
                new APIError(module, 403, 'Ticket already binded', {
                    mol: meanOfLogin.toJSON()
                })
            );
        });
};
