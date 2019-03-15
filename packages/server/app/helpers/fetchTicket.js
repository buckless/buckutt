const { embedParser, embedFilter } = require('server/app/utils/embedParser');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, ticketNumber) => {
    const embedTicket = [{ embed: 'wallet' }, { embed: 'wallet.user' }];
    const embedTicketFilters = embedTicket.filter(rel => rel.required).map(rel => rel.embed);

    const ticketData = await ctx.models.Ticket.query({
        where: { logical_id: ticketNumber },
        orWhere: { physical_id: ticketNumber }
    })
        .fetch({ withRelated: embedParser(embedTicket) })
        .then(ticket => (ticket ? embedFilter(embedTicketFilters, [ticket.toJSON()])[0] : null));

    if (!ticketData) {
        throw new APIError(module, 404, "Couldn't find ticket", ticketNumber);
    }

    return ticketData;
};
