const creditWallet = require('server/app/helpers/creditWallet');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { amount, debitorWallet, creditorWallet }) => {
    if (debitorWallet.credit - amount < 0) {
        throw new APIError(module, 400, 'Not enough sender credit', {
            sender: ctx.user.id,
            credit: ctx.user.credit,
            amount
        });
    }

    if (creditorWallet.credit + amount > ctx.event.maxPerAccount) {
        throw new APIError(module, 400, 'Too much reciever credit', {
            receiver: creditorWallet.id,
            credit: ctx.user.credit,
            amount
        });
    }

    const newTransfer = new ctx.models.Transfer({
        amount,
        debitor_id: debitorWallet.id,
        creditor_id: creditorWallet.id
    });

    const updateSender = creditWallet(ctx, debitorWallet.id, -1 * amount);
    const updateReciever = creditWallet(ctx, creditorWallet.id, amount);

    await Promise.all([updateSender, updateReciever, newTransfer.save()]);
};
