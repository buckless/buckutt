const uuid   = require('uuid');
const config = require('../../config');

module.exports = {
    makePayment(app, data) {
        const Transaction = app.locals.models.Transaction;

        const transaction = new Transaction({
            state  : 'pending',
            amount : data.amount,
            user_id: data.buyer.id
        });

        return transaction
            .save()
            .then(() => {
                setTimeout(() => module.exports.callback(app, transaction.get('id'), data), 1000);

                return {
                    type: 'url',
                    res : `${config.urls.managerUrl}/#/reload/success`
                };
            });
    },

    callback(app, id, data) {
        if (!app || !id || !data) {
            // disable callback as a router (called from controllers)
            return () => {};
        }

        const Transaction       = app.locals.models.Transaction;
        const GiftReload        = app.locals.models.GiftReload;
        const Reload            = app.locals.models.Reload;
        const PendingCardUpdate = app.locals.models.PendingCardUpdate;

        let giftReloads;

        return GiftReload
            .fetchAll()
            .then(giftReloads_ => ((giftReloads_ && giftReloads_.length) ? giftReloads_.toJSON() : []))
            .then((giftReloads_) => {
                giftReloads = giftReloads_;

                return Transaction.where({ id }).fetch();
            })
            .then((transaction) => {
                transaction.set('transactionId', uuid());
                transaction.set('state', 'ACCEPTED');

                if (transaction.get('state') === 'ACCEPTED') {
                    const amount = transaction.get('amount');

                    const newReload = new Reload({
                        credit   : amount,
                        type     : 'card',
                        trace    : transaction.get('id'),
                        point_id : data.point,
                        buyer_id : transaction.get('user_id'),
                        seller_id: transaction.get('user_id')
                    });

                    const reloadGiftAmount = giftReloads
                        .map(gr => Math.floor(amount / gr.everyAmount) * gr.amount)
                        .reduce((a, b) => a + b, 0);

                    const reloadGift = new Reload({
                        credit   : reloadGiftAmount,
                        type     : 'gift',
                        trace    : `card-${amount}`,
                        point_id : data.point,
                        buyer_id : transaction.get('user_id'),
                        seller_id: transaction.get('user_id')
                    });

                    const reloadGiftSave = reloadGiftAmount
                        ? reloadGift.save()
                        : Promise.resolve();

                    const pendingCardUpdate = new PendingCardUpdate({
                        user_id: transaction.get('user_id'),
                        amount
                    });

                    return Promise
                        .all([newReload.save(), transaction.save(), pendingCardUpdate.save(), reloadGiftSave])
                        .then(() => {
                            app.locals.modelChanges.emit('userCreditUpdate', {
                                id     : transaction.get('user_id'),
                                pending: amount
                            });
                        });
                }

                return transaction.save();
            });
    }
};
