const creditUser = require('@/helpers/creditUser');
const getPriceAmount = require('@/utils/getPriceAmount');
const APIError = require('@/utils/APIError');

const getUserInst = (User, userId) => User.where({ id: userId }).fetch();

module.exports = async (ctx, { id, rawType, clientTime }) => {
    const transactionModels = {
        transfer: 'Transfer',
        reload: 'Reload',
        purchase: 'Purchase',
        promotion: 'Purchase',
        refund: 'Refund'
    };

    const currentModel = transactionModels[rawType];

    if (!currentModel) {
        throw new APIError(module, 400, 'Invalid transaction type');
    }

    const transaction = await ctx.models[currentModel]
        .where({ id })
        .fetch({ require: true })
        .then(transaction => (transaction ? transaction.toJSON() : null));

    // don't check if from client and card data are used
    const checkApiCredit = ctx.point.name === 'Internet' || !ctx.event.useCardData;

    let amount;
    switch (currentModel) {
        case 'Purchase':
            amount = await getPriceAmount(ctx.models.Price, transaction.price_id);
            break;
        case 'Reload':
            amount = transaction.credit;
            break;
        default:
            amount = transaction.amount;
    }

    const pendingCardUpdates = {};

    if (currentModel === 'Purchase' || currentModel === 'Refund') {
        const user = await getUserInst(ctx.models.User, transaction.buyer_id);
        pendingCardUpdates[user.id] = amount;
    } else if (currentModel === 'Reload') {
        const user = await getUserInst(ctx.models.User, transaction.buyer_id);

        if (user.get('credit') - amount < 0 && checkApiCredit) {
            throw new APIError(module, 403, "User doesn't have enough credit");
        }

        pendingCardUpdates[user.id] = -1 * amount;
    } else {
        const sender = await getUserInst(ctx.models.User, transaction.sender_id);

        if (sender.get('credit') - amount < 0 && checkApiCredit) {
            throw new APIError(module, 403, "User doesn't have enough credit");
        }

        pendingCardUpdates[sender.id] = -1 * amount;

        const reciever = await getUserInst(ctx.models.User, transaction.reciever_id);
        pendingCardUpdates[reciever.id] = amount;
    }

    const queries = Object.keys(pendingCardUpdates).map(user =>
        creditUser(ctx, user, pendingCardUpdates[user])
    );

    const Model = ctx.models[currentModel];

    await Promise.all(queries);

    await new Model({ id: transaction.id }).save(
        {
            clientDeletion: clientTime,
            deleted_at: new Date(),
            active: false
        },
        { patch: true }
    );
};
