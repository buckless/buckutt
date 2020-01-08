export default route => {
    const now = new Date();

    const relations = {
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
            }
        ],
        coupons: ['couponSet', 'couponSet.articles'],
        devices: [
            'wikets',
            {
                embed: 'wikets.point',
                required: true
            },
            {
                embed: 'wikets.period',
                filters: [['end', '>', now]],
                required: true
            },
            'wikets.defaultGroup'
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
            'defaultGroup',
            'wikets',
            'wikets.accesses',
            'wikets.accesses.wallet',
            'wikets.accesses.wallet.user',
            'wikets.accesses.operator'
        ],
        prices: ['period', 'fundation', 'group'],
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
        users: [
            'wallets',
            'rights',
            {
                embed: 'rights.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'rights.point',
                required: true
            },
            'memberships',
            {
                embed: 'memberships.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'memberships.group',
                required: true
            },
            'transactions'
        ],
        wallets: [
            'user',
            //            'ticket',
            'memberships',
            {
                embed: 'memberships.period',
                filters: [['end', '>', now]],
                required: true
            },
            {
                embed: 'memberships.group',
                required: true
            },
            'transactions'
        ],
        wikets: [
            {
                embed: 'point',
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
