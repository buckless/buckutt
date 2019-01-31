const { countBy } = require('lodash');
const { bookshelf, models } = require('@/db');
const creditUser = require('@/helpers/creditUser');
const createUser = require('@/helpers/createUser');
const rightsDetails = require('@/utils/rightsDetails');
const APIError = require('@/utils/APIError');

const getPriceAmount = (Price, id) =>
    Price.where({ id })
        .fetch()
        .then(price => price.get('amount'));

module.exports = async (ctx, { molToCheck, basket, clientTime }) => {
    const mol = await ctx.models.MeanOfLogin.where(molToCheck)
        .fetch({ withRelated: ['user'] })
        .then(mol => (mol ? mol.toJSON() : null));

    let buyer;

    if (!mol || !mol.user || !mol.user.id) {
        buyer = await createUser(
            ctx,
            {},
            [],
            [molToCheck],
            [ctx.event.defaultGroup_id],
            false,
            true,
            clientTime
        );
    } else {
        buyer = mol.user;
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

    const promotionsCosts = await Promise.all(
        purchases.map(item =>
            Promise.all(
                item.articles.map(article => getPriceAmount(ctx.models.Price, article.price))
            )
        )
    );

    purchases = purchases.map((purchase, i) => ({
        ...purchase,
        articles: purchase.articles.map((article, j) => ({
            ...article,
            cost: promotionsCosts[i][j]
        }))
    }));

    const purchasesInsts = [];
    const reloadsInsts = [];

    const transactionIds = { purchases: [], reloads: [] };

    const totalCost = basket
        .map(item => {
            if (typeof item.cost === 'number') {
                return item.cost;
            }

            return typeof item.credit === 'number' ? -1 * item.credit : 0;
        })
        .reduce((a, b) => a + b);

    const reloadOnly = basket
        .filter(item => typeof item.credit === 'number')
        .map(item => item.credit)
        .reduce((a, b) => a + b, 0);

    if (buyer.credit < totalCost && !ctx.event.useCardData) {
        throw new APIError(module, 400, 'Not enough credit');
    }

    if (
        ctx.event.maxPerAccount &&
        buyer.credit - totalCost > ctx.event.maxPerAccount &&
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

    const newCredit = buyer.credit - totalCost;

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
                buyer_id: buyer.id,
                price_id: item.price_id,
                point_id: ctx.point.id,
                promotion_id: item.promotion_id || null,
                seller_id: ctx.user.id,
                alcohol: item.alcohol,
                clientTime
            });

            const savePurchase = purchase
                .save()
                .then(() => transactionIds.purchases.push(purchase.id))
                .then(() =>
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
            const reload = new models.Reload({
                credit: item.credit,
                type: item.type,
                trace: item.trace || '',
                point_id: ctx.point.id,
                buyer_id: buyer.id,
                seller_id: ctx.user.id,
                clientTime
            });

            const saveReload = reload.save().then(() => transactionIds.reloads.push(reload.id));

            reloadsInsts.push(saveReload);
        }
    });

    const updateCredit = creditUser(ctx, buyer.id, -1 * totalCost);
    buyer.credit = newCredit;

    await Promise.all([updateCredit].concat(purchasesInsts).concat(reloadsInsts));

    return {
        updatedBuyer: buyer,
        transactionIds
    };
};
