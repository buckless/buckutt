const express = require('express');
const connectSdk = require('connect-sdk-nodejs');
const { promisify } = require('util');
const APIError = require('../errors/APIError');
const logger = require('../lib/log');
const dbCatch = require('../lib/dbCatch');
const config = require('../../config');

const log = logger(module);

connectSdk.hostedcheckouts.create = promisify(connectSdk.hostedcheckouts.create);
connectSdk.hostedcheckouts.get = promisify(connectSdk.hostedcheckouts.get);

const providerConfig = config.provider.config;

connectSdk.init({
    host: 'eu.sandbox.api-ingenico.com',
    scheme: 'https',
    port: 443,
    enableLogging: true,
    logger: log,
    apiKeyId: providerConfig.apiKeyId,
    secretApiKey: providerConfig.secretApiKey,
    integrator: 'Studio Async'
});

module.exports = {
    makePayment(app, data) {
        const Transaction = app.locals.models.Transaction;

        const transaction = new Transaction({
            state: 'pending',
            amount: data.amount,
            user_id: data.buyer.id,
            includeCard: !data.buyer.hasPaidInitialCard && req.event.cardCost > 0
        });

        return transaction
            .save()
            .then(() => {
                const order = {
                    cardPaymentMethodSpecificInput: {
                        skipAuthentication: true
                    },
                    order: {
                        amountOfMoney: {
                            currencyCode: 'EUR',
                            amount: data.amount
                        },
                        customer: {
                            billingAddress: {
                                countryCode: 'FR'
                            },
                            contactDetails: {
                                emailAddress: data.buyer.email
                            },
                            personalInformation: {
                                name: {
                                    firstName: data.buyer.firstname,
                                    surname: data.buyer.lastname
                                }
                            },
                            merchantCustomerId: data.buyer.id.slice(0, 3) + data.buyer.id.slice(24)
                        },
                        shoppingCart: {
                            items: [
                                {
                                    amountOfMoney: {
                                        currencyCode: 'EUR',
                                        amount: data.amount
                                    },
                                    invoiceData: {
                                        description: 'Rechargement cashless',
                                        nrOfItems: '1',
                                        pricePerItem: data.amount
                                    }
                                }
                            ]
                        }
                    },
                    hostedCheckoutSpecificInput: {
                        variant: providerConfig.variant,
                        locale: 'fr_FR',
                        showResultPage: false,
                        returnUrl: `${config.urls.managerUrl}/reload/success`
                    }
                };

                if (!data.buyer.hasPaidInitialCard && req.event.cardCost > 0) {
                    order.order.amountOfMoney.amount += req.event.cardCost;
                    order.order.shoppingCart.items.push({
                        amountOfMoney: {
                            currencyCode: 'EUR',
                            amount: req.event.cardCost
                        },
                        invoiceData: {
                            description: 'Activation du support',
                            nrOfItems: '1',
                            pricePerItem: req.event.cardCost
                        }
                    });
                }

                return connectSdk.hostedcheckouts.create(providerConfig.merchantId, order, null);
            })
            .then(result => {
                if (result.body.errors) {
                    const errs = JSON.stringify(result.body.errors);

                    return Promise.reject(new APIError(module, 500, 'epayments failed', errs));
                }

                transaction.set(
                    'transactionId',
                    `${result.body.hostedCheckoutId}_${result.body.RETURNMAC}`
                );

                return transaction.save().then(() => ({
                    type: 'url',
                    res: `${providerConfig.urlPrefix}.${result.body.partialRedirectUrl}`
                }));
            });
    },

    callback() {
        const router = new express.Router();

        router.get('/provider/callback', (req, res, next) => {
            const Transaction = req.app.locals.models.Transaction;
            const Reload = req.app.locals.models.Reload;
            const PendingCardUpdate = req.app.locals.models.PendingCardUpdate;

            const isNotification = req.query.isNotification;
            const hostedCheckoutId = req.query.hostedCheckoutId;
            const RETURNMAC = req.query.RETURNMAC;

            if (!hostedCheckoutId || hostedCheckoutId.length < 1) {
                return next(new APIError(module, 400, 'No hostedCheckoutId provided'));
            }

            if (!RETURNMAC || RETURNMAC.length < 1) {
                return next(new APIError(module, 400, 'No RETURNMAC provided'));
            }

            let paymentDetails;
            let giftReloads;

            connectSdk.hostedcheckouts
                .get(providerConfig.merchantId, req.query.hostedCheckoutId, null)
                .then(result => {
                    paymentDetails = result.body;

                    return GiftReload.fetchAll();
                })
                .then(
                    giftReloads_ =>
                        giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : []
                )
                .then(giftReloads_ => {
                    giftReloads = giftReloads_;

                    return Transaction.where({
                        transactionId: `${req.query.hostedCheckoutId}_${req.query.RETURNMAC}`
                    }).fetch({ withRelated: ['user'] });
                })
                .then(transaction => {
                    if (!transaction) {
                        if (isNotification) {
                            res
                                .status(404)
                                .json({})
                                .end();
                        } else {
                            res.redirectTo(`${config.urls.managerUrl}/reload/failed`);
                        }

                        return;
                    }

                    transaction.set(
                        'state',
                        paymentDetails.createdPaymentOutput.paymentStatusCategory
                    );
                    transaction.set(
                        'longState',
                        paymentDetails.createdPaymentOutput.payment.status
                    );

                    if (transaction.get('state') === 'SUCCESSFUL') {
                        transaction.set('active', null);
                        transaction.set('deleted_at', new Date());

                        const newReload = new Reload({
                            credit: transaction.get('amount'),
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
                            amount: transaction.get('amount')
                        });

                        if (transaction.get('includeCard')) {
                            transaction.related('user').set('hasPaidInitialCard', true);
                            transaction.related('user').set('hasPaidCard', true);
                        }

                        return Promise.all([
                            newReload.save(),
                            transaction.save(),
                            pendingCardUpdate.save(),
                            transaction.related('user').save(),
                            reloadGiftSave
                        ]).then(() => {
                            req.app.locals.modelChanges.emit('userCreditUpdate', {
                                id: transaction.get('user_id'),
                                pending: transaction.get('amount')
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
                        res.redirectTo(`${config.urls.managerUrl}/reload/success`);
                    }
                })
                .catch(err => dbCatch(module, err, next));
        });

        return router;
    }
};
