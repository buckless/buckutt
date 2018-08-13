const express = require('express');
const axios = require('axios');
const dbCatch = require('../lib/dbCatch');
const creditUser = require('../lib/creditUser');
const config = require('../../config');
const log = require('../lib/log')(module);

const providerConfig = config.provider.billetweb;

module.exports = {
    makePayment(app, data) {
        const Transaction = app.locals.models.Transaction;

        const transaction = new Transaction({
            state: 'pending',
            amount: data.amount,
            user_id: data.buyer.id
        });

        return transaction.save().then(() => {
            const formData = JSON.stringify([
                {
                    1: encodeURIComponent(data.buyer.mail),
                    2: encodeURIComponent(data.buyer.lastname),
                    3: encodeURIComponent(data.buyer.firstname),
                    10037: transaction.get('id')
                }
            ]);

            const query = [
                `form_data=${formData}`,
                `price=${data.amount / 100}`,
                `ticket=${providerConfig.ticket}`
            ];

            const res = providerConfig.url + '&' + query.join('&');

            return {
                type: 'url',
                res
            };
        });
    },

    callback() {
        const router = new express.Router();

        router.get('/provider/callback', (req, res, next) => {
            const Transaction = req.app.locals.models.Transaction;
            const GiftReload = req.app.locals.models.GiftReload;
            const Reload = req.app.locals.models.Reload;

            if (!req.query.form_data) {
                return res
                    .status(404)
                    .json({})
                    .end();
            }

            let formData;
            let transactionId;
            let transaction;
            let giftReloads;
            try {
                formData = JSON.parse(req.query.form_data);

                if (!formData[0] || !formData[0]['10037']) {
                    throw new Error();
                }

                formData = formData[0];
            } catch (_) {
                return res
                    .status(404)
                    .json({})
                    .end();
            }

            GiftReload.fetchAll()
                .then(
                    giftReloads_ =>
                        giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : []
                )
                .then(giftReloads_ => {
                    giftReloads = giftReloads_;

                    return Transaction.where({
                        id: formData['10037']
                    }).fetch();
                })
                .then(transaction_ => {
                    if (!transaction_) {
                        return Promise.reject(new Error('Transaction not found'));
                    }

                    transaction = transaction_;

                    const url = `https://www.billetweb.fr/api/event/${
                        providerConfig.event
                    }/attendees`;
                    const params = {
                        user: providerConfig.user,
                        key: providerConfig.key,
                        version: providerConfig.version
                    };
                    return axios.get(url, { params });
                })
                .then(res => {
                    const ticket = res.data.find(
                        t => t.custom_order.Transaction === transaction.get('id')
                    );

                    if (!ticket) {
                        return Promise.reject(new Error('Transaction not found'));
                    }

                    transaction.set('amount', Math.floor(ticket.price * 100));

                    const amount = transaction.get('amount');

                    transaction.set('state', ticket.order_paid ? 'SUCCESS' : 'FAILED');

                    if (transaction.get('state') === 'SUCCESS') {
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
                    return res
                        .status(200)
                        .json({})
                        .end();
                })
                .catch(err => {
                    if (err.message === 'Transaction not found') {
                        return res
                            .status(302)
                            .header('Location', `${config.urls.managerUrl}/reload/failed`)
                            .end();
                    }

                    return Promise.reject(err);
                })
                .catch(err => dbCatch(module, err, next));
        });

        return router;
    }
};
