const express = require('express');
const connectSdk = require('connect-sdk-nodejs');
const { promisify } = require('util');
const APIError = require('../errors/APIError');
const log = require('../lib/log')(module);
const dbCatch = require('../lib/dbCatch');
const creditUser = require('../lib/creditUser');
const config = require('../../config');

connectSdk.hostedcheckouts.create = promisify(connectSdk.hostedcheckouts.create);
connectSdk.hostedcheckouts.get = promisify(connectSdk.hostedcheckouts.get);

const providerConfig = config.provider.epayments;

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
            user_id: data.buyer.id
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
            const GiftReload = req.app.locals.models.GiftReload;
            const Reload = req.app.locals.models.Reload;

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
                    }).fetch();
                })
                .then(transaction => {
                    if (!transaction) {
                        if (isNotification) {
                            res
                                .status(404)
                                .json({})
                                .end();
                        } else {
                            res.redirect(`${config.urls.managerUrl}/reload/failed`);
                        }

                        return;
                    }

                    const amount = transaction.get('amount');

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
                            credit: amount,
                            type: 'card',
                            trace: transaction.get('id'),
                            point_id: req.point.id,
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
                            point_id: req.point.id,
                            buyer_id: transaction.get('user_id'),
                            seller_id: transaction.get('user_id')
                        });

                        const reloadGiftSave = reloadGiftAmount
                            ? reloadGift.save()
                            : Promise.resolve();

                        const updateUser = creditUser(req, transaction.get('user_id'), amount);

                        return Promise.all([
                            newReload.save(),
                            transaction.save(),
                            updateUser,
                            reloadGiftSave
                        ]);
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
                        res.redirect(`${config.urls.managerUrl}/reload/success`);
                    }
                })
                .catch(err => dbCatch(module, err, next));
        });

        return router;
    }
};
