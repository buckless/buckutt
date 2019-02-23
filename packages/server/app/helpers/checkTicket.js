const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, meansOfLogin) => {
    const ticket = meansOfLogin.find(mol => mol.type === 'ticketId');

    if (!ticket) {
        return;
    }

    const meanOfLogin = await ctx.models.MeanOfLogin.where({
        type: 'ticketId',
        blocked: false,
        data: ticket.data
    }).fetch({ withRelated: ['user'] });

    if (!meanOfLogin) {
        return;
    }

    throw new APIError(module, 403, 'Ticket already binded', { mol: meanOfLogin.toJSON() });
};
