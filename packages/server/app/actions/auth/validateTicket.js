const fetchTicket = require('server/app/helpers/fetchTicket');
const APIError = require('server/app/utils/APIError');

const validateTicket = async (ctx, { ticketNumber, clientTime }) => {
    if (!ticketNumber) {
        return Promise.reject(new APIError(module, 400, 'The ticket number must be provided'));
    }

    const ticket = await fetchTicket(ctx, ticketNumber);

    if (ticket.validation) {
        return Promise.reject(new APIError(module, 400, 'This ticket has already been validated'));
    }

    await new ctx.models.Ticket({
        id: ticket.id
    }).save(
        {
            validation: new Date(clientTime)
        },
        {
            patch: true
        }
    );

    return {
        ...ticket,
        validation: new Date(clientTime)
    };
};

module.exports = {
    validateTicket
};
