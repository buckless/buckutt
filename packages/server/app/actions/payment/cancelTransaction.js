const { bookshelf } = require('server/app/db');
const creditUser = require('server/app/helpers/creditUser');
const getPriceAmount = require('server/app/utils/getPriceAmount');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { id, rawType, clientTime }) => {
    const transactionModels = {
        reload: 'Reload',
        purchase: 'Purchase',
        promotion: 'Purchase'
    };

    const currentModel = transactionModels[rawType];

    if (!currentModel) {
        throw new APIError(module, 400, 'Invalid transaction type');
    }

    const withRelated = currentModel === 'Purchase' ? ['articles', 'buyer'] : ['buyer'];

    const transaction = await ctx.models[currentModel]
        .where({ id })
        .fetch({ require: true, withRelated })
        .then(transaction => (transaction ? transaction.toJSON() : null));

    // don't check if from client and card data are used
    const checkApiCredit = ctx.point.name === 'Internet' || !ctx.event.useCardData;

    const isAlreadyACancellation = transaction.isCancellation;
    const user = transaction.buyer;

    const cancellationData = {
        ...transaction,
        seller_id: ctx.user.id,
        isCancellation: !isAlreadyACancellation,
        clientTime: clientTime || new Date()
    };

    delete cancellationData.id;
    delete cancellationData.created_at;
    delete cancellationData.updated_at;
    delete cancellationData.articles;

    if (currentModel === 'Purchase') {
        const amount = await getPriceAmount(ctx.models.Price, transaction.price_id);
        const pending = isAlreadyACancellation ? -1 * amount : amount;

        if (user.credit + pending < 0 && checkApiCredit) {
            throw new APIError(module, 403, "User doesn't have enough credit");
        }

        await creditUser(ctx, user.id, pending);
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
        const pending = isAlreadyACancellation ? transaction.credit : -1 * transaction.credit;

        if (user.credit + pending < 0 && checkApiCredit) {
            throw new APIError(module, 403, "User doesn't have enough credit");
        }

        await creditUser(ctx, user.id, pending);
        await new ctx.models.Reload(cancellationData).save();
    }
};
