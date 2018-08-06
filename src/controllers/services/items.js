const express = require('express');
const APIError = require('../../errors/APIError');
const rightsDetails = require('../../lib/rightsDetails');
const dbCatch = require('../../lib/dbCatch');
const log = require('../../lib/log')(module);

const router = new express.Router();

// Polling every 10 minutes
router.get('/services/items', (req, res, next) => {
    const userRights = rightsDetails(req.user, req.point.id);

    if (!userRights.operator) {
        return next(new APIError(module, 401, 'No operator right'));
    }

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
        .then(prices => {
            prices
                .filter(price => price.period.id && price.point.id && price.fundation.id)
                .forEach(price => {
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

            log.info(`Get point items`, req.details);

            res
                .status(200)
                .json({
                    articles,
                    promotions
                })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
