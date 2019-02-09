const creditUser = require('@/helpers/creditUser');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, { amount, recieverUser }) => {
    if (ctx.user.credit - amount < 0) {
        throw new APIError(module, 400, 'Not enough sender credit', {
            sender: ctx.user.id,
            credit: ctx.user.credit,
            amount
        });
    }

    if (recieverUser.credit + amount > ctx.event.maxPerAccount) {
        throw new APIError(module, 400, 'Too much reciever credit', {
            receiver: recieverUser.id,
            credit: ctx.user.credit,
            amount
        });
    }

    const newTransfer = new ctx.models.Transfer({
        amount,
        sender_id: ctx.user.id,
        reciever_id: recieverUser.id
    });

    const updateSender = creditUser(ctx, ctx.user.id, -1 * amount);
    const updateReciever = creditUser(ctx, recieverUser.id, amount);

    await Promise.all([updateSender, updateReciever, newTransfer.save()]);
};
