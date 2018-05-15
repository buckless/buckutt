const express = require('express');
const { countBy } = require('lodash');
const APIError = require('../../errors/APIError');
const createUser = require('../../lib/createUser');
const logger = require('../../lib/log');
const vat = require('../../lib/vat');
const { bookshelf } = require('../../lib/bookshelf');
const rightsDetails = require('../../lib/rightsDetails');
const dbCatch = require('../../lib/dbCatch');

const log = logger(module);

const getPriceAmount = (Price, priceId) =>
    Price.where({ id: priceId })
        .fetch()
        .then(price => price ? price.get('amount') : 0);

/**
 * Basket controller. Handles purchases and reloads
 */
const router = new express.Router();

// Get the buyer
router.post('/services/basket', (req, res, next) => {
    log.info(`Processing basket ${JSON.stringify(req.body)}`, req.details);

    if (!req.body.buyer || !req.body.molType || !Array.isArray(req.body.basket)) {
        return next(new APIError(module, 400, 'Invalid basket'));
    }

    if (req.body.basket.length === 0) {
        return res
            .status(200)
            .json({})
            .end();
    }

    req.buyer = req.body.buyer;
    req.molType = req.body.molType;

    if (!req.buyer || !req.molType) {
        return next(new APIError(module, 400, 'Invalid buyer'));
    }

    const molToCheck = {
        type: req.molType,
        data: req.buyer,
        blocked: false
    };

    req.app.locals.models.MeanOfLogin.where(molToCheck)
        .fetch({
            withRelated: ['user']
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user || !mol.user.id) {
                // Don't create a new account if the card was already assigned
                if (!req.event.useCardData || req.body.assignedCard) {
                    return next(new APIError(module, 400, 'Invalid buyer'));
                }

                return createUser(
                    req.app.locals.models,
                    req.event,
                    req.user,
                    req.point,
                    {},
                    [],
                    [molToCheck],
                    [req.event.defaultGroup_id],
                    false,
                    true
                );
            }

            return Promise.resolve(mol.user);
        })
        .then(user => {
            req.buyer = user;
            req.buyer.pin = '';
            req.buyer.password = '';
            next();
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/basket', (req, res, next) => {
    const { Price } = req.app.locals.models;
    let purchases = req.body.basket.filter(item => typeof item.cost === 'number');

    const getArticleCosts = purchases.map(purchase => getPriceAmount(Price, purchase.price_id));

    const initialPromise = Promise.all(getArticleCosts).then(articleCosts => {
        purchases = purchases.map((purchase, i) => {
            purchase.cost = articleCosts[i];

            return purchase;
        });
    });

    const getPromotionsCosts = purchases.map(item =>
        Promise.all(item.articles.map(article => getPriceAmount(Price, article.price)))
    );

    initialPromise
        .then(() => Promise.all(getPromotionsCosts))
        .then(promotionsCosts => {
            purchases = purchases.map((purchase, i) => {
                purchase.articles = purchase.articles.map((amount, j) => {
                    amount.cost = promotionsCosts[i][j];

                    return amount;
                });

                return purchase;
            });
        })
        .then(() => next())
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/basket', (req, res, next) => {
    const models = req.app.locals.models;

    // Purchases documents
    const purchases = [];
    // Reloads documents
    const reloads = [];

    const transactionIds = { purchases: [], reloads: [] };

    const totalCost = req.body.basket
        .map(item => {
            if (typeof item.cost === 'number') {
                return item.cost;
            } else if (typeof item.credit === 'number') {
                return -1 * item.credit;
            }
        })
        .reduce((a, b) => a + b);

    const reloadOnly = req.body.basket
        .filter(item => typeof item.credit === 'number')
        .map(item => item.credit)
        .reduce((a, b) => a + b, 0);

    if (req.buyer.credit < totalCost && !req.event.useCardData) {
        return next(new APIError(module, 400, 'Not enough credit'));
    }

    if (
        req.event.maxPerAccount &&
        req.buyer.credit - totalCost > req.event.maxPerAccount &&
        reloadOnly > 0 &&
        !req.event.useCardData
    ) {
        const max = (req.event.maxPerAccount / 100).toFixed(2);
        return next(new APIError(module, 400, `Maximum exceeded : ${max}€`, { user: req.user.id }));
    }

    if (req.event.minReload && reloadOnly < req.event.minReload && reloadOnly > 0) {
        const min = (req.event.minReload / 100).toFixed(2);
        return next(new APIError(module, 400, `Can not reload less than : ${min}€`));
    }

    const newCredit = req.buyer.credit - totalCost;

    if (Number.isNaN(newCredit)) {
        log.error('credit is not a number');

        return res
            .status(400)
            .json(req.buyer)
            .end();
    }

    const userRights = rightsDetails(req.user, req.point_id);

    const unallowedPurchase =
        req.body.basket.find(item => typeof item.cost === 'number') &&
        !userRights.sell &&
        !userRights.assign;
    const unallowedReload =
        req.body.basket.find(item => typeof item.credit === 'number') && !userRights.reload;

    if (unallowedPurchase || unallowedReload) {
        return next(
            new APIError(module, 401, 'No right to reload or sell', {
                user: req.user.id,
                unallowedPurchase,
                unallowedReload
            })
        );
    }

    req.body.basket.forEach(item => {
        if (typeof item.cost === 'number') {
            // Purchases
            const articlesIds = item.articles.map(article => article.id);
            const countIds = countBy(articlesIds);

            const purchase = new models.Purchase({
                buyer_id: req.buyer.id,
                price_id: item.price_id,
                point_id: req.point_id,
                promotion_id: item.promotion_id || null,
                seller_id: req.user.id,
                alcohol: item.alcohol,
                vat: vat(item),
                created_at: req.body.created_at || new Date(),
                updated_at: req.body.created_at || new Date()
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
                                created_at: req.body.created_at || new Date(),
                                updated_at: req.body.created_at || new Date(),
                                deleted_at: null
                            });
                        })
                    )
                );

            purchases.push(savePurchase);
        } else if (typeof item.credit === 'number') {
            // Reloads
            const reload = new models.Reload({
                credit: item.credit,
                type: item.type,
                trace: item.trace || '',
                point_id: req.point_id,
                buyer_id: req.buyer.id,
                seller_id: req.user.id,
                created_at: req.body.created_at || new Date(),
                updated_at: req.body.created_at || new Date()
            });

            const saveReload = reload.save().then(() => transactionIds.reloads.push(reload.id));

            reloads.push(saveReload);
        }
    });

    const updatedAt = req.body.created_at || new Date();

    const updateCredit = bookshelf
        .knex('users')
        .where({ id: req.buyer.id })
        .update({
            credit: newCredit,
            updated_at: updatedAt
        });

    req.buyer.credit = newCredit;
    req.buyer.updated_at = updatedAt;

    Promise.all([updateCredit].concat(purchases).concat(reloads))
        .then(() => {
            req.app.locals.modelChanges.emit('userCreditUpdate', {
                id: req.buyer.id,
                credit: req.buyer.credit,
                pending: newCredit - req.buyer.credit
            });

            return res
                .status(200)
                .json({
                    transactionIds,
                    ...req.buyer
                })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
