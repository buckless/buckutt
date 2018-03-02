const express  = require('express');
const dbCatch  = require('../lib/dbCatch');
const { knex } = require('../lib/bookshelf');
const config   = require('../../config');

const providerConfig = config.provider.config;

module.exports = (app) => {
    const Transaction       = app.locals.models.Transaction;
    const Reload            = app.locals.models.Reload;
    const PendingCardUpdate = app.locals.models.PendingCardUpdate;
    const etupay            = require('node-etupay')(providerConfig);
    const Basket            = etupay.Basket;

    app.locals.makePayment = (data) => {
        const transaction = new Transaction({
            state  : 'pending',
            amount : data.amount,
            user_id: data.buyer.id
        });

        return transaction
            .save()
            .then(() => {
                const basket = new Basket(
                    `Rechargement ${providerConfig.merchantName}`,
                    data.buyer.firstname,
                    data.buyer.lastname,
                    data.buyer.email,
                    'checkout',
                    transaction.get('id')
                );

                basket.addItem('Rechargement', data.amount, 1);

                return {
                    type: 'url',
                    res : basket.compute()
                };
            });
    };

    const router = new express.Router();

    router.use(etupay.router);

    router.post('/callback', (req, res, next) => {
        Transaction
            .where({ id: req.etupay.serviceData })
            .fetch()
            .then((transaction) => {
                // this should not happen \o
                if (!transaction) {
                    return res.status(404).json({}).end();
                }

                transaction.set('transactionId', req.etupay.transactionId);
                transaction.set('state', req.etupay.step);

                if (req.etupay.paid) {
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
            .then(() => res.status(200).json({}).end())
            .catch(err => dbCatch(module, err, next));
    });

    app.use('/provider', router);
};
