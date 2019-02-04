const Payline = require('flav-payline');
const moment = require('moment');
const config = require('@/config');
const APIError = require('@/utils/APIError');
const creditUser = require('@/helpers/creditUser');
const ctx = require('@/utils/ctx');

const providerConfig = config.provider.payline;

const ns = type => ({ xsi_type: { type, xmlns: 'http://obj.ws.payline.experian.com' } });
const currencies = { eur: 978 };
const actions = { payment: 101, refund: 421 };
const modes = { full: 'CPT', differed: 'DIF', nInstalments: 'NX', recurring: 'REC' };
const dateFormat = 'DD/MM/YYYY HH:mm';

const onlinePayment = (ctx, data) => {
    const payline = new Payline(providerConfig.id, providerConfig.password);

    const transaction = new ctx.models.Transaction({
        state: 'pending',
        amount: data.amount,
        user_id: data.buyer.id
    });

    return transaction
        .save()
        .then(() => {
            const order = {
                version: 18,
                payment: {
                    attributes: ns('payment'),
                    amount: data.amount,
                    currency: currencies.eur,
                    action: actions.payment,
                    mode: modes.full,
                    contractNumber: providerConfig.contractNumber
                },
                returnURL: `${config.urls.managerUrl}/reload/success`,
                cancelURL: `${config.urls.managerUrl}/reload/failed`,
                order: {
                    attributes: ns('order'),
                    ref: transaction.get('id'),
                    country: 'FR',
                    amount: data.amount,
                    currency: currencies.eur,
                    date: moment().format(dateFormat)
                },
                notificationURL: `${config.urls.managerUrl}/api/provider/callback`,
                // selectedContractList: [ config.contractNumber ],
                buyer: {
                    attributes: ns('buyer'),
                    firstName: data.buyer.firstname,
                    lastName: data.buyer.lastname,
                    email: data.buyer.email
                },
                merchantName: config.merchantName
            };

            return payline.runAction('doWebPayment', order);
        })
        .then(result => {
            transaction.set('transactionId', result.token);

            return transaction.save().then(() => ({
                type: 'url',
                res: result.redirectURL
            }));
        });
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    async callback(req, res) {
        const payline = new Payline(providerConfig.id, providerConfig.password, providerConfig.url);
        const { Transaction, GiftReload, Reload } = req.app.locals.models;

        const isNotification =
            req.query.notificationType && req.query.notificationType === 'webtrs';
        const token = req.query.token;

        if (!token || token.length < 1) {
            throw new APIError(module, 400, 'No token provided');
        }

        const giftReloads = await GiftReload.fetchAll().then(grs =>
            grs && grs.length ? grs.toJSON() : []
        );

        const paymentDetails = await payline.runAction('getWebPaymentDetailsRequest', {
            version: 18,
            token
        });

        const transaction = await Transaction.where({ transactionId: req.query.token }).fetch({
            withRelated: ['user']
        });

        transaction.set('state', paymentDetails.result.shortMessage);
        transaction.set('longState', paymentDetails.result.longMessage);

        const amount = transaction.get('amount');

        if (transaction.get('state') === 'ACCEPTED') {
            const newReload = new Reload({
                credit: amount,
                type: 'card',
                trace: transaction.get('id'),
                point_id: req.point_id,
                buyer_id: transaction.get('user_id'),
                seller_id: transaction.get('user_id')
            });

            const reloadGiftAmount = giftReloads
                .filter(gr => amount >= gr.minimalAmount)
                .map(gr => Math.floor(amount / gr.everyAmount) * gr.amount)
                .reduce((a, b) => a + b, 0);

            const reloadGift = new Reload({
                credit: reloadGiftAmount,
                type: 'gift',
                trace: `card-${amount}`,
                point_id: req.point_id,
                buyer_id: transaction.get('user_id'),
                seller_id: transaction.get('user_id')
            });

            const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

            const updateUser = creditUser(ctx(req), transaction.get('user_id'), amount);

            await Promise.all([newReload.save(), transaction.save(), updateUser, reloadGiftSave]);

            req.app.locals.modelChanges.emit('userCreditUpdate', {
                id: transaction.get('user_id'),
                pending: amount
            });
        } else {
            await transaction.save();
        }

        return isNotification
            ? res.json({})
            : res.redirect(`${config.urls.managerUrl}/#/reload/success`);
    }
};
