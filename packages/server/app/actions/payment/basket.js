const { countBy } = require('lodash');
const { bookshelf } = require('server/app/db');
const createWallet = require('server/app/helpers/createWallet');
const creditWallet = require('server/app/helpers/creditWallet');
const rightsDetails = require('server/app/utils/rightsDetails');
const APIError = require('server/app/utils/APIError');

const getPrice = (Price, id) =>
    Price.where({ id })
        .fetch()
        .then(price => price.toJSON());

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

    let purchases = basket.filter(item => item.itemType === 'purchase');

    const getArticlePrices = purchases.map(purchase =>
        getPrice(ctx.models.Price, purchase.price_id)
    );

    const articlePrices = await Promise.all(getArticlePrices);

    purchases = purchases.map((purchase, i) => ({
        ...purchase,
        // Apply the custom price only if it's allowed for this price and lower than the fixed price
        amount:
            ctx.event.useCardData ||
            (purchase.amount < articlePrices[i].amount && articlePrices[i].freePrice)
                ? purchase.amount
                : articlePrices[i].amount
    }));

    const reloads = basket.filter(item => item.itemType === 'reload');
    const refunds = basket.filter(item => item.itemType === 'refund');
    const computedBasket = reloads.concat(refunds, purchases);

    const totalCost = computedBasket.reduce((a, b) => {
        let amount = isCancellation ? -1 * b.amount : b.amount;
        amount = b.itemType === 'reload' ? -1 * amount : amount;

        return a + amount;
    }, 0);

    if (wallet.credit < totalCost && !ctx.event.useCardData) {
        throw new APIError(module, 400, 'Not enough credit');
    }

    // The maximum credit has to be calculated on all possible credits
    const creditOnly = computedBasket
        .filter(
            item =>
                (isCancellation && item.itemType !== 'reload') ||
                (!isCancellation && item.itemType === 'reload')
        )
        .reduce((a, b) => a + b.amount, 0);

    if (
        ctx.event.maxPerAccount &&
        wallet.credit - totalCost > ctx.event.maxPerAccount &&
        creditOnly > 0 &&
        !ctx.event.useCardData
    ) {
        const max = (ctx.event.maxPerAccount / 100).toFixed(2);
        throw new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: ctx.user.id });
    }

    // The minimum reload has to be calculated only on a true reload, not on cancellations
    const reloadOnly = computedBasket
        .filter(item => !isCancellation && item.itemType === 'reload')
        .reduce((a, b) => a + b.amount, 0);

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
        !computedBasket.find(
            item =>
                item.itemType === 'purchase' &&
                item.articles.find(article => article.id !== ctx.event.nfc_id)
        );

    const unallowedPurchase =
        computedBasket.find(item => item.itemType === 'purchase') &&
        !userRights.sell &&
        !onlyNfcDevice;
    const unallowedReload =
        computedBasket.find(item => item.itemType !== 'purchase') && !userRights.reload;

    // allow purchase if it's a nfc card and the operator is a reloader
    if (unallowedPurchase || unallowedReload) {
        throw new APIError(module, 401, 'No right to reload or sell', {
            user: ctx.user.id,
            unallowedPurchase,
            unallowedReload
        });
    }

    const basketInsts = [];

    computedBasket.forEach(item => {
        if (item.itemType === 'purchase') {
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
                amount: item.amount,
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

            basketInsts.push(savePurchase);
        } else if (item.itemType === 'reload') {
            // reloads
            const reload = new ctx.models.Reload({
                credit: item.amount,
                type: item.type,
                trace: item.trace || '',
                point_id: ctx.point.id,
                wallet_id: wallet.id,
                seller_id: ctx.user.id,
                clientTime,
                isCancellation
            });

            basketInsts.push(reload.save());
        } else if (item.itemType === 'refund') {
            // refunds
            const refund = new ctx.models.Refund({
                amount: item.amount,
                type: item.type,
                trace: item.trace || '',
                point_id: ctx.point.id,
                wallet_id: wallet.id,
                seller_id: ctx.user.id,
                clientTime,
                isCancellation
            });

            basketInsts.push(refund.save());
        }
    });

    const updateCredit = creditWallet(ctx, wallet.id, -1 * totalCost);
    wallet.credit = newCredit;

    await Promise.all([updateCredit].concat(basketInsts));

    return {
        updatedWallet: wallet
    };
};
