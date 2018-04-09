const translation = {
    article: 'articles',
    category: 'categories',
    device: 'devices',
    event: 'events',
    fundation: 'fundations',
    giftreload: 'giftreloads',
    group: 'groups',
    period: 'periods',
    point: 'points',
    promotion: 'promotions',
    user: 'users',
    webservice: 'webservices',
    // Special cases
    participant: 'users',
    wiket: 'points'
};

export default path => translation[path];
