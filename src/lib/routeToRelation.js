export default route => {
    const now = new Date();

    const relations = {
        accesses: [
            'meanOfLogin',
            'meanOfLogin.user',
            'operator',
            'wiket',
            'wiket.period',
            'wiket.point'
        ],
        articles: [
            'prices',
            {
                embed: 'prices.fundation',
                required: true
            },
            {
                embed: 'prices.group',
                required: true
            },
            {
                embed: 'prices.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'prices.point',
                required: true
            }
        ],
        categories: [
            'articles',
            'articles.prices',
            {
                embed: 'articles.prices.fundation',
                required: true
            },
            {
                embed: 'articles.prices.group',
                required: true
            },
            {
                embed: 'articles.prices.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'articles.prices.point',
                required: true
            }
        ],
        events: ['defaultFundation', 'defaultGroup', 'defaultPeriod'],
        memberships: [
            {
                embed: 'period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'group',
                required: true
            }
        ],
        points: [
            'categories',
            'categories.articles',
            'categories.articles.prices',
            {
                embed: 'categories.articles.prices.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'categories.articles.prices.point',
                required: true
            },
            'defaultGroup',
            'wikets',
            {
                embed: 'wikets.device',
                required: true
            },
            {
                embed: 'wikets.period',
                filters: [['end', '>', now]],
                required: true
            },
            'wikets.defaultGroup'
        ],
        prices: [
            {
                embed: 'fundation',
                required: true
            },
            {
                embed: 'group',
                required: true
            },
            {
                embed: 'period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'point',
                required: true
            }
        ],
        promotions: [
            'sets',
            'sets.articles',
            'prices',
            {
                embed: 'prices.fundation',
                required: true
            },
            {
                embed: 'prices.group',
                required: true
            },
            {
                embed: 'prices.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'prices.point',
                required: true
            }
        ],
        rights: [
            {
                embed: 'period',
                filters: [['end', '>', now]],
                required: true
            },
            'point',
            {
                embed: 'user',
                required: true
            }
        ],
        transfers: ['sender', 'reciever'],
        users: [
            'meansOfLogin',
            'rights',
            {
                embed: 'rights.period',
                filters: [['end', '>', now]],
                required: true
            },
            'rights.point',
            'memberships',
            {
                embed: 'memberships.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'memberships.group',
                required: true
            }
        ],
        wikets: [
            {
                embed: 'device',
                required: true
            },
            {
                embed: 'period',
                filters: [['end', '>', now]],
                required: true
            },
            'defaultGroup'
        ]
    };

    return relations[route] ? encodeURIComponent(JSON.stringify(relations[route])) : null;
};
