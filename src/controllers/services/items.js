const express = require('express');
const APIError = require('../../errors/APIError');
const rightsDetails = require('../../lib/rightsDetails');
const dbCatch = require('../../lib/dbCatch');
const log = require('../../lib/log')(module);

const router = new express.Router();

router.get('/services/items', (req, res, next) => {
    const userRights = rightsDetails(req.user, req.point.id);

    if (!userRights.operator) {
        return next(new APIError(module, 401, 'No operator right'));
    }

    if (!req.query.buyer || !req.query.molType) {
        return next();
    }

    const models = req.app.locals.models;
    const now = new Date();

    return models.MeanOfLogin.where({
        type: req.query.molType,
        data: req.query.buyer,
        blocked: false
    })
        .fetch({
            withRelated: [
                'user',
                'user.memberships',
                'user.purchases',
                'user.purchases.price',
                'user.purchases.price.period',
                {
                    'user.memberships.period': query =>
                        query.where('start', '<=', now).where('end', '>=', now)
                }
            ]
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user.id) {
                return next(new APIError(module, 404, 'Buyer not found'));
            }

            const buyer = mol.user;

            req.details.buyer = buyer.id;

            req.buyer = buyer;
            req.buyer.pin = '';
            req.buyer.password = '';

            next();
        })
        .catch(err => dbCatch(module, err, next));
});

router.get('/services/items', (req, res, next) => {
    const models = req.app.locals.models;
    const now = new Date();
    let articles = [];
    let promotions = [];

    models.Price.query(price => price.where('point_id', req.point.id))
        .fetchAll({
            withRelated: [
                {
                    period: query => query.where('end', '>=', now)
                },
                'point',
                'fundation',
                'promotion',
                'promotion.sets',
                'promotion.sets.articles',
                'article',
                'article.categories',
                'article.categories.points'
            ]
        })
        .then(prices => (prices ? prices.toJSON() : null))
        .filter(price => price.period.id && price.point.id && price.fundation.id)
        .then(prices => {
            prices.forEach(price => {
                if (price.promotion && price.promotion.id) {
                    const promotionSets = price.promotion.sets.map(set => ({
                        id: set.id,
                        name: set.name,
                        articles: set.articles
                    }));

                    promotions.push({
                        id: price.promotion.id,
                        name: price.promotion.name,
                        price: {
                            id: price.id,
                            amount: price.amount,
                            group: price.group_id,
                            start: price.period.start,
                            end: price.period.end
                        },
                        sets: promotionSets
                    });
                }

                if (price.article && price.article.id) {
                    const matchReqPoint = point => point.id === req.point.id;
                    price.article.categories
                        .filter(cat => cat.points.some(matchReqPoint))
                        .forEach(category => {
                            articles.push({
                                id: price.article.id,
                                name: price.article.name,
                                vat: price.article.vat,
                                alcohol: price.article.alcohol,
                                price: {
                                    id: price.id,
                                    amount: price.amount,
                                    group: price.group_id,
                                    start: price.period.start,
                                    end: price.period.end
                                },
                                category: {
                                    id: category.id,
                                    name: category.name,
                                    priority: category.priority
                                }
                            });
                        });
                }
            });

            if (req.details.buyer) {
                log.info(`Get items for buyer ${req.details.buyer}`, req.details);
            } else {
                log.info(`Get point items`, req.details);
            }

            res
                .status(200)
                .json({
                    buyer: req.buyer,
                    articles,
                    promotions
                })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
