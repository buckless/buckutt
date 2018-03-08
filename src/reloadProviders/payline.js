const express  = require('express');
const Payline  = require('flav-payline');
const moment   = require('moment');
const APIError = require('../errors/APIError');
const dbCatch  = require('../lib/dbCatch');
const ns       = require('../lib/ns');
const config   = require('../../config');

const providerConfig = config.provider.config;

const currencies = {
    eur: 978
};

const actions = {
    payment: 101,
    refund : 421
};

const modes = {
    full        : 'CPT',
    differed    : 'DIF',
    nInstalments: 'NX',
    recurring   : 'REC'
};

const dateFormat = 'DD/MM/YYYY HH:mm';

module.exports = (app) => {
    const payline           = new Payline(providerConfig.id, providerConfig.password, providerConfig.url);
    const Transaction       = app.locals.models.Transaction;
    const Reload            = app.locals.models.Reload;
    const PendingCardUpdate = app.locals.models.PendingCardUpdate;

    app.locals.makePayment = (data) => {
        const transaction = new Transaction({
            state  : 'pending',
            amount : data.amount,
            user_id: data.buyer.id
        });

        return transaction
            .save()
            .then(() => payline.runAction('doWebPayment', {
                version: 18,
                payment: {
                    attributes    : ns('payment'),
                    amount        : data.amount,
                    currency      : currencies.eur,
                    action        : actions.payment,
                    mode          : modes.full,
                    contractNumber: providerConfig.contractNumber
                },
                returnURL: `${config.urls.managerUrl}/#/reload/success`,
                cancelURL: `${config.urls.managerUrl}/#/reload/failed`,
                order    : {
                    attributes: ns('order'),
                    ref       : transaction.get('id'),
                    country   : 'FR',
                    amount    : data.amount,
                    currency  : currencies.eur,
                    date      : moment().format(dateFormat)
                },
                notificationURL: `${config.urls.managerUrl}/api/provider/callback`,
                // selectedContractList: [ config.contractNumber ],
                buyer          : {
                    attributes: ns('buyer'),
                    firstName : data.buyer.firstname,
                    lastName  : data.buyer.lastname,
                    email     : data.buyer.email
                },
                merchantName: config.merchantName
            }))
            .then((result) => {
                transaction.set('transactionId', result.token);

                return transaction
                    .save()
                    .then(() => ({
                        type: 'url',
                        res : result.redirectURL
                    }));
            });
    };

    const router = new express.Router();

    router.get('/callback', (req, res, next) => {
        const isNotification = req.query.notificationType && req.query.notificationType === 'webtrs';
        const token          = req.query.token;

        if (!token || token.length < 1) {
            return next(new APIError(module, 400, 'No token provided'));
        }

        let paymentDetails;

        payline
            .runAction('getWebPaymentDetailsRequest', {
                version: 18,
                token
            })
            .then((result) => {
                paymentDetails = result;

                return Transaction.where({ transactionId: req.query.token }).fetch();
            })
            .then((transaction) => {
                transaction.set('state', paymentDetails.result.shortMessage);
                transaction.set('longState', paymentDetails.result.longMessage);

                if (transaction.get('state') === 'ACCEPTED') {
                    const newReload = new Reload({
                        credit   : transaction.get('amount'),
                        type     : 'card',
                        trace    : transaction.get('id'),
                        point_id : req.point_id,
                        buyer_id : transaction.get('user_id'),
                        seller_id: transaction.get('user_id')
                    });

                    const pendingCardUpdate = new PendingCardUpdate({
                        user_id: transaction.get('user_id'),
                        amount : transaction.get('amount')
                    });

                    return Promise
                        .all([newReload.save(), transaction.save(), pendingCardUpdate.save()])
                        .then(() => {
                            req.app.locals.modelChanges.emit('userCreditUpdate', {
                                id     : transaction.get('user_id'),
                                pending: transaction.get('amount')
                            });
                        });
                }

                return transaction.save();
            })
            .then(() => {
                if (isNotification) {
                    res.status(200).json({}).end();
                } else {
                    res.redirectTo(`${config.urls.managerUrl}/#/reload/success`);
                }
            })
            .catch(err => dbCatch(module, err, next));
    });

    app.use('/provider', router);
};
