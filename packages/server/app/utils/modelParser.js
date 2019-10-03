const APIError = require('server/app/utils/APIError');

const modelsNames = {
    alerts: 'Alert',
    articles: 'Article',
    categories: 'Category',
    devices: 'Device',
    events: 'Event',
    fundations: 'Fundation',
    groups: 'Group',
    giftreloads: 'GiftReload',
    healthalerts: 'HealthAlert',
    memberships: 'Membership',
    meansofpayment: 'MeanOfPayment',
    accesses: 'Access',
    periods: 'Period',
    pendingcardupdates: 'PendingCardUpdate',
    wikets: 'Wiket',
    points: 'Point',
    prices: 'Price',
    promotions: 'Promotion',
    purchases: 'Purchase',
    refunds: 'Refund',
    reloads: 'Reload',
    rights: 'Right',
    sets: 'Set',
    tickets: 'Ticket',
    transfers: 'Transfer',
    transactions: 'Transaction',
    users: 'User',
    wallets: 'Wallet',
    webservices: 'Webservice',
    withdrawals: 'Withdrawal'
};

const possibleValues = Object.keys(modelsNames);

// modelParser, suitable for req.param
const modelParser = (req, _, next, model) => {
    if (possibleValues.indexOf(model.toLowerCase()) === -1) {
        return next(new APIError(module, 404, 'Model not found'));
    }

    req.model = req.app.locals.models[modelsNames[model.toLowerCase()]];

    return next();
};

module.exports = modelParser;
module.exports.modelsNames = modelsNames;
