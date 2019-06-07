const { bookshelf } = require('server/app/db');
const creditWallet = require('server/app/helpers/creditWallet');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { id, rawType, clientTime }) => {
    const transactionModels = {
        reload: 'Reload',
        refund: 'Refund',
        purchase: 'Purchase',
        promotion: 'Purchase'
    };

    const currentModel = transactionModels[rawType];

    if (!currentModel) {
        throw new APIError(module, 400, 'Invalid transaction type');
    }

    const withRelated = currentModel === 'Purchase' ? ['articles', 'wallet'] : ['wallet'];

    const transaction = await ctx.models[currentModel]
        .where({ id })
        .fetch({ require: true, withRelated })
        .then(transaction => (transaction ? transaction.toJSON() : null));

    const isAlreadyACancellation = transaction.isCancellation;
    const wallet = transaction.wallet;

    const cancellationData = {
        ...transaction,
        seller_id: ctx.user.id,
        point_id: ctx.point.id,
        isCancellation: !isAlreadyACancellation,
        clientTime: clientTime || new Date()
    };

    delete cancellationData.id;
    delete cancellationData.created_at;
    delete cancellationData.updated_at;
    delete cancellationData.articles;
    delete cancellationData.wallet;

    let pending;
    if (currentModel === 'Reload') {
        pending = isAlreadyACancellation ? transaction.credit : -1 * transaction.credit;
    } else {
        pending = isAlreadyACancellation ? -1 * transaction.amount : transaction.amount;
    }

    if (wallet.credit + pending < 0 && !ctx.event.useCardData) {
        throw new APIError(module, 403, "Wallet doesn't have enough credit");
    }

    await creditWallet(ctx, wallet.id, pending);

    if (currentModel === 'Purchase') {
        const newTransaction = await new ctx.models.Purchase(cancellationData).save();

        await Promise.all(
            transaction.articles.map(article =>
                bookshelf.knex('articles_purchases').insert({
                    article_id: article.id,
                    purchase_id: newTransaction.get('id'),
                    count: article._pivot_count,
                    deleted_at: null
                })
            )
        );
    } else if (currentModel === 'Reload') {
        await new ctx.models.Reload(cancellationData).save();
    } else if (currentModel === 'Refund') {
        await new ctx.models.Refund(cancellationData).save();
    }
};
