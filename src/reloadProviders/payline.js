const express = require('express');
const Payline = require('flav-payline');
const moment = require('moment');
const APIError = require('../errors/APIError');
const dbCatch = require('../lib/dbCatch');
const ns = require('../lib/ns');
const config = require('../../config');

const providerConfig = config.provider.payline;

const currencies = {
    eur: 978
};

const actions = {
    payment: 101,
    refund: 421
};

const modes = {
    full: 'CPT',
    differed: 'DIF',
    nInstalments: 'NX',
    recurring: 'REC'
};

const dateFormat = 'DD/MM/YYYY HH:mm';

module.exports = {
    makePayment(app, data) {
        const payline = new Payline(providerConfig.id, providerConfig.password);
        const Transaction = app.locals.models.Transaction;

        const transaction = new Transaction({
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
    },

    callback() {
        const router = new express.Router();

        router.get('/provider/callback', (req, res, next) => {
            const payline = new Payline(
                providerConfig.id,
                providerConfig.password,
                providerConfig.url
            );
            const Transaction = req.app.locals.models.Transaction;
            const GiftReload = req.app.locals.models.GiftReload;
            const Reload = req.app.locals.models.Reload;
            const PendingCardUpdate = req.app.locals.models.PendingCardUpdate;

            const isNotification =
                req.query.notificationType && req.query.notificationType === 'webtrs';
            const token = req.query.token;

            if (!token || token.length < 1) {
                return next(new APIError(module, 400, 'No token provided'));
            }

            let paymentDetails;
            let giftReloads;

            GiftReload.fetchAll()
                .then(
                    giftReloads_ =>
                        giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : []
                )
                .then(giftReloads_ => {
                    giftReloads = giftReloads_;

                    return payline.runAction('getWebPaymentDetailsRequest', {
                        version: 18,
                        token
                    });
                })
                .then(result => {
                    paymentDetails = result;

                    return Transaction.where({ transactionId: req.query.token }).fetch({
                        withRelated: ['user']
                    });
                })
                .then(transaction => {
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

                        const reloadGiftSave = reloadGiftAmount
                            ? reloadGift.save()
                            : Promise.resolve();

                        const pendingCardUpdate = new PendingCardUpdate({
                            user_id: transaction.get('user_id'),
                            amount
                        });

                        return Promise.all([
                            newReload.save(),
                            transaction.save(),
                            pendingCardUpdate.save(),
                            transaction.related('user').save(),
                            reloadGiftSave
                        ]).then(() => {
                            req.app.locals.modelChanges.emit('userCreditUpdate', {
                                id: transaction.get('user_id'),
                                pending: amount
                            });
                        });
                    }

                    return transaction.save();
                })
                .then(() => {
                    if (isNotification) {
                        res
                            .status(200)
                            .json({})
                            .end();
                    } else {
                        res.redirect(`${config.urls.managerUrl}/#/reload/success`);
                    }
                })
                .catch(err => dbCatch(module, err, next));
        });

        return router;
    }
};
