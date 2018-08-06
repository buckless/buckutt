const express = require('express');
const uuid = require('uuid');
const config = require('../../config');
const creditUser = require('../lib/creditUser');

module.exports = {
    makePayment(app, data) {
        const Transaction = app.locals.models.Transaction;

        const transaction = new Transaction({
            state: 'pending',
            amount: data.amount,
            user_id: data.buyer.id
        });

        return transaction.save().then(() => {
            setTimeout(() => module.exports.fakeCallback(app, transaction.get('id'), data), 1000);

            return {
                type: 'url',
                res: `${config.urls.managerUrl}/reload/success`
            };
        });
    },

    callback() {
        return new express.Router();
    },

    fakeCallback(app, id, data) {
        if (!app || !id || !data) {
            // disable callback as a router (called from controllers)
            return () => {};
        }

        const Transaction = app.locals.models.Transaction;
        const GiftReload = app.locals.models.GiftReload;
        const Reload = app.locals.models.Reload;
        const Event = app.locals.models.Event;

        let giftReloads;
        let useCardData;

        return GiftReload.fetchAll()
            .then(
                giftReloads_ => (giftReloads_ && giftReloads_.length ? giftReloads_.toJSON() : [])
            )
            .then(giftReloads_ => {
                giftReloads = giftReloads_;

                return Event.fetchAll();
            })
            .then(events => {
                useCardData = events.toJSON()[0].useCardData;

                return Transaction.where({ id }).fetch();
            })
            .then(transaction => {
                transaction.set('transactionId', uuid());
                transaction.set('state', 'ACCEPTED');

                if (transaction.get('state') === 'ACCEPTED') {
                    const amount = transaction.get('amount');

                    const newReload = new Reload({
                        credit: amount,
                        type: 'card',
                        trace: transaction.get('id'),
                        point_id: data.point,
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
                        point_id: data.point,
                        buyer_id: transaction.get('user_id'),
                        seller_id: transaction.get('user_id')
                    });

                    const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

                    const updateUser = creditUser(
                        {
                            app,
                            event: {
                                useCardData
                            },
                            point: {
                                name: 'Internet'
                            }
                        },
                        transaction.get('user_id'),
                        amount
                    );

                    return Promise.all([
                        newReload.save(),
                        transaction.save(),
                        updateUser,
                        reloadGiftSave
                    ]);
                }

                return transaction.save();
            });
    }
};
