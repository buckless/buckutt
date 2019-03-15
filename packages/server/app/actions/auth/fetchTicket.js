const fetchTicket = require('server/app/helpers/fetchTicket');
const { embedParser, embedFilter } = require('server/app/utils/embedParser');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, ticketNumber) => {
    const ticket = await fetchTicket(ctx, ticketNumber);

    if (ticket.wallet.logical_id) {
        throw new APIError(module, 400, 'This ticket is already assigned to a card', ticketNumber);
    }

    const now = new Date();
    const embedWallet = [
        { embed: 'user', required: true },
        { embed: 'user.memberships' },
        {
            embed: 'user.memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        },
        { embed: 'memberships ' },
        {
            embed: 'memberships.period',
            filters: [['start', '<', now], ['end', '>', now]],
            required: true
        }
    ];

    const embedWalletFilters = embedWallet.filter(rel => rel.required).map(rel => rel.embed);

    let wallet;
    let memberships = [];

    // If the ticket doesn't exists, or if the ticket is already assign, get the wallet & the user responsible of that
    if (!ticket || ticket.wallet_id) {
        wallet = await ctx.models.Wallet.where({ id: ticket.wallet_id || ticketNumber })
            .fetch({ withRelated: embedParser(embedWallet) })
            .then(wallet => {
                const wallets = wallet ? [wallet.toJSON()] : [];
                return embedFilter(embedWalletFilters, wallets);
            });

        if (!wallet) {
            throw new APIError(module, 404, "Couldn't find ticket", ticketNumber);
        }

        memberships = wallet.memberships
            .concat(wallet.user.memberships)
            .map(membership => ({ id: membership.group_id }));
    }

    return {
        credit: wallet ? wallet.credit : ticket.amount,
        name: wallet
            ? `${wallet.user.firstname} ${wallet.user.lastname}`
            : `${ticket.firstname} ${ticket.lastname}`,
        id: wallet ? wallet.id : ticket.id,
        walletId: wallet ? wallet.id : null,
        ticketId: ticket ? ticket.id : null,
        barcode: ticket ? ticket.logical_id : null,
        physicalId: ticket ? ticket.physical_id : null,
        currentGroups: memberships
    };
};
