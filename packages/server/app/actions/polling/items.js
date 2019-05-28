module.exports = async ctx => {
    const now = new Date();
    let articles = [];
    let promotions = [];

    const prices = await ctx.models.Price.query(price => price.where('point_id', ctx.point.id))
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
        .then(prices => (prices ? prices.toJSON() : null));

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
                price.article.categories
                    .filter(cat => cat.points.some(point => point.id === ctx.point.id))
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
                                end: price.period.end,
                                freePrice: price.freePrice
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

    return { articles, promotions };
};
