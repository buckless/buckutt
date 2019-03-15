const { bookshelf } = require('server/app/db');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, walletId, amount, alreadyWritten) => {
    const isFromInternet = ctx.point.name === 'Internet';
    const useCardData = ctx.event.useCardData;

    const isAlreadyWritten = alreadyWritten || (!isFromInternet && useCardData);

    const wallet = await ctx.models.Wallet.where({ id: walletId }).fetch();

    if (!wallet) {
        throw new APIError(module, 404, 'Wallet not found', { walletId });
    }

    let walletCredit = wallet.get('credit');

    if (amount !== 0) {
        if (!isAlreadyWritten) {
            await new ctx.models.PendingCardUpdate({
                wallet_id: walletId,
                amount
            }).save();
        }

        await ctx.models.Wallet.query()
            .where({ id: walletId })
            .update({
                updated_at: new Date(),
                credit: bookshelf.knex.raw(`credit + ${amount}`)
            });

        walletCredit += amount;
    }

    const pending = await ctx.models.PendingCardUpdate.query()
        .where({ wallet_id: walletId, active: true })
        .sum('amount as sumAmount');

    const changes = {
        id: walletId,
        pending: pending[0].sumAmount,
        credit: walletCredit
    };

    ctx.pub.publish('walletCreditUpdate', JSON.stringify(changes));

    return changes;
};
