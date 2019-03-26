const { countBy } = require('lodash');
const { bookshelf } = require('server/app/db');
const createWallet = require('server/app/helpers/createWallet');
const creditWallet = require('server/app/helpers/creditWallet');
const rightsDetails = require('server/app/utils/rightsDetails');
const APIError = require('server/app/utils/APIError');

const getPriceAmount = (Price, id) =>
    Price.where({ id })
        .fetch()
        .then(price => price.get('amount'));

module.exports = async (ctx, { walletId, basket, clientTime, isCancellation }) => {
    let wallet = await ctx.models.Wallet.where({
        logical_id: walletId,
        blocked: false
    })
        .fetch({ withRelated: ['user'] })
        .then(wallet => (wallet ? wallet.toJSON() : null));

    if (!wallet) {
        wallet = await createWallet(ctx, {
            logicalId: walletId,
            clientTime
        });
    }

    let purchases = basket.filter(item => typeof item.cost === 'number');

    const getArticleCosts = purchases.map(purchase =>
        getPriceAmount(ctx.models.Price, purchase.price_id)
    );

    const articleCosts = await Promise.all(getArticleCosts);

    purchases = purchases.map((purchase, i) => ({
        ...purchase,
        cost: articleCosts[i]
    }));

    const purchasesInsts = [];
    const reloadsInsts = [];

    // If it's a cancellation: credit credit is becoming a cost, cost is becoming a credit
    const totalCost = basket
        .map(item => {
            if (typeof item.cost === 'number') {
                return isCancellation ? -1 * item.cost : item.cost;
            } else if (typeof item.credit === 'number') {
                return isCancellation ? item.credit : -1 * item.credit;
            }

            return 0;
        })
        .reduce((a, b) => a + b);

    const reloadOnly = basket
        .filter(item =>
            isCancellation ? typeof item.cost === 'number' : typeof item.credit === 'number'
        )
        .map(item => (isCancellation ? item.cost : item.credit))
        .reduce((a, b) => a + b, 0);

    if (wallet.credit < totalCost && !ctx.event.useCardData) {
        throw new APIError(module, 400, 'Not enough credit');
    }

    if (
        ctx.event.maxPerAccount &&
        wallet.credit - totalCost > ctx.event.maxPerAccount &&
        reloadOnly > 0 &&
        !ctx.event.useCardData
    ) {
        const max = (ctx.event.maxPerAccount / 100).toFixed(2);
        throw new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: ctx.user.id });
    }

    if (ctx.event.minReload && reloadOnly < ctx.event.minReload && reloadOnly > 0) {
        const min = (ctx.event.minReload / 100).toFixed(2);
        throw new APIError(module, 400, `Can not reload less than : ${min}€`);
    }

    const newCredit = wallet.credit - totalCost;

    if (Number.isNaN(newCredit)) {
        throw new APIError(module, 400, `Credit is not a number`);
    }

    const userRights = rightsDetails(ctx.user, ctx.point.id);

    // allow purchase of NFC supports only if the operator is reloader or assigner
    const onlyNfcDevice =
        (userRights.reload || userRights.assign) &&
        !basket.find(
            item =>
                typeof item.cost === 'number' &&
                item.articles.find(article => article.id !== ctx.event.nfc_id)
        );

    const unallowedPurchase =
        basket.find(item => typeof item.cost === 'number') && !userRights.sell && !onlyNfcDevice;
    const unallowedReload =
        basket.find(item => typeof item.credit === 'number') && !userRights.reload;

    // allow purchase if it's a nfc card and the operator is a reloader
    if (unallowedPurchase || unallowedReload) {
        throw new APIError(module, 401, 'No right to reload or sell', {
            user: ctx.user.id,
            unallowedPurchase,
            unallowedReload
        });
    }

    basket.forEach(item => {
        if (typeof item.cost === 'number') {
            // purchases
            const articlesIds = item.articles.map(article => article.id);
            const countIds = countBy(articlesIds);

            const purchase = new ctx.models.Purchase({
                wallet_id: wallet.id,
                price_id: item.price_id,
                point_id: ctx.point.id,
                promotion_id: item.promotion_id || null,
                seller_id: ctx.user.id,
                alcohol: item.alcohol,
                clientTime,
                isCancellation
            });

            const savePurchase = purchase.save().then(() =>
                Promise.all(
                    Object.keys(countIds).map(articleId => {
                        const count = countIds[articleId];

                        return bookshelf.knex('articles_purchases').insert({
                            article_id: articleId,
                            purchase_id: purchase.id,
                            count,
                            deleted_at: null
                        });
                    })
                )
            );

            purchasesInsts.push(savePurchase);
        } else if (typeof item.credit === 'number') {
            // reloads
            const reload = new ctx.models.Reload({
                credit: item.credit,
                type: item.type,
                trace: item.trace || '',
                point_id: ctx.point.id,
                wallet_id: wallet.id,
                seller_id: ctx.user.id,
                clientTime,
                isCancellation
            });

            reloadsInsts.push(reload.save());
        }
    });

    const updateCredit = creditWallet(ctx, wallet.id, -1 * totalCost);
    wallet.credit = newCredit;

    await Promise.all([updateCredit].concat(purchasesInsts).concat(reloadsInsts));

    return {
        updatedWallet: wallet
    };
};
