const express = require('express');
const dbCatch = require('../lib/dbCatch');
const creditUser = require('../lib/creditUser');
const config = require('../../config');

const providerConfig = config.provider.etupay;

module.exports = {
    makePayment(app, data) {
        const Transaction = app.locals.models.Transaction;
        const etupay = require('node-etupay')(providerConfig);
        const Basket = etupay.Basket;

        const transaction = new Transaction({
            state: 'pending',
            amount: data.amount,
            user_id: data.buyer.id
        });

        return transaction.save().then(() => {
            const basket = new Basket(
                `Rechargement ${config.merchantName}`,
                data.buyer.firstname,
                data.buyer.lastname,
                data.buyer.email,
                'checkout',
                transaction.get('id')
            );

            basket.addItem('Rechargement', data.amount, 1);

            return {
                type: 'url',
                res: basket.compute()
            };
        });
    },

    callback() {
        const etupay = require('node-etupay')(providerConfig);

        const router = new express.Router();

        router.use(etupay.router);

        router.post('/provider/callback', (req, res, next) => {
            const Transaction = req.app.locals.models.Transaction;
            const Reload = req.app.locals.models.Reload;
            const GiftReload = req.app.locals.models.GiftReload;

            let giftReloads;

            GiftReload.fetchAll()
                .then(
                    giftReloads_ =>
                        giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : []
                )
                .then(giftReloads_ => {
                    giftReloads = giftReloads_;

                    return Transaction.where({ id: req.etupay.serviceData }).fetch();
                })
                .then(transaction => {
                    // this should not happen \o
                    if (!transaction) {
                        return res
                            .status(404)
                            .json({})
                            .end();
                    }

                    const amount = transaction.get('amount');

                    transaction.set('transactionId', req.etupay.transactionId);
                    transaction.set('state', req.etupay.step);

                    if (req.etupay.paid) {
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
                .then(() =>
                    res
                        .status(200)
                        .json({})
                        .end()
                )
                .catch(err => dbCatch(module, err, next));
        });

        return router;
    }
};
