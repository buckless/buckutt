const creditWallet = require('server/app/helpers/creditWallet');

module.exports = async (ctx, { ticket, wallet, clientTime }) => {
    const ticketToAssign = await ctx.models.Ticket.where({ id: ticket.id }).fetch();

    // If the ticket was already assigned to a wallet previously, don't give the preload again
    if (!ticketToAssign.get('wallet_id') && ticketToAssign.get('amount') > 0) {
        await creditWallet(ctx, wallet.id, ticketToAssign.get('amount'));

        await new ctx.models.Reload({
            type: 'card',
            credit: ticketToAssign.get('amount'),
            wallet_id: wallet.id,
            seller_id: ctx.user ? ctx.user.id : wallet.user_id,
            point_id: ctx.point.id,
            trace: ticketToAssign.get('id'),
            clientTime
        }).save();
    }

    ticketToAssign.set('wallet_id', wallet.id);
    await ticketToAssign.save();

    return ticketToAssign.toJSON();
};
