const express       = require('express');
const connectSdk    = require('connect-sdk-nodejs');
const moment        = require('moment');
const { promisify } = require('util');
const APIError      = require('../errors/APIError');
const dbCatch       = require('../lib/dbCatch');
const { knex }      = require('../lib/bookshelf');
const ns            = require('../lib/ns');
const config        = require('../../config');

connectSdk.hostedcheckouts.create = promisify(connectSdk.hostedcheckouts.create);
connectSdk.hostedcheckouts.get    = promisify(connectSdk.hostedcheckouts.get);

const providerConfig = config.provider.config;

module.exports = (app) => {
    connectSdk.init({
        host: 'https://api.globalcollect.com',
        scheme: 'https',
        port: 443,
        apiKeyId: providerConfig.apiKeyId,
        secretApiKey: providerConfig.secretApiKey,
        integrator: 'Studio Async'
    });

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
            .then(() => connectSdk.hostedcheckouts.create(
                providerConfig.merchantId,
                {
                    cardPaymentMethodSpecificInput: {
                        customerReference: transaction.get('id');
                        skipAuthentication: true
                    }
                    order: {
                        amountOfMoney: {
                            currencyCode: 'EUR',
                            amount      : data.amount
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
                                    lastName : data.buyer.lastname
                                }
                            },
                            merchantCustomerId: data.buyer.id
                        },
                        seller: {
                            address: {
                                city: 'Rosières-prés-Troyes',
                                countryCode: 'FR',
                                houseNumber: '2',
                                street: 'rue Gustave Eiffel',
                                zip: '10430'
                            }
                        },
                        shoppingCard: {
                            items: [
                                {
                                    amountOfMoney: {
                                        currencyCode: 'EUR',
                                        amount      : data.amount
                                    },
                                    invoiceData: {
                                        description : 'Rechargement cashless',
                                        nrOfItems   : '1',
                                        pricePerItem: data.amount
                                    }
                                }
                            ]
                        }
                    },
                    hostedCheckoutSpecificInput: {
                        variant       : providerConfig.variant,
                        locale        : 'fr_FR',
                        showResultPage: false,
                        returnUrl     : `${config.urls.managerUrl}/reload/success`
                    }
                },
                null
            )
            .then((result) => {
                transaction.set('transactionId', `${result.hostedCheckoutId}_${result.RETURNMAC}`);

                return transaction
                    .save()
                    .then(() => ({
                        type: 'url',
                        res : `${providerConfig.urlPrefix}${result.partialRedirectUrl}`
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

        connectSdk.hostedcheckouts.get(providerConfig.merchantId, req.query.token, null)
            .then((result) => {
                paymentDetails = result;

                return Transaction.where({ transactionId: req.query.token }).fetch();
            })
            .then((transaction) => {
                transaction.set('state', paymentDetails.createdPaymentOutput.paymentStatusCategory);
                transaction.set('longState', paymentDetails.createdPaymentOutput.payment.status);

                if (transaction.get('state') === 'SUCCESSFUL') {
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
                        .then((results) => {
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
                    res.redirectTo(`${config.urls.managerUrl}/reload/success`);
                }
            })
            .catch(err => dbCatch(module, err, next));
    });

    app.use('/provider', router);
};
