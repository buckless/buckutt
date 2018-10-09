const express = require('express');
const config = require('@/config');
const ctx = require('@/utils/ctx');

const providerConfig = config.provider.etupay;

const onlinePayment = async (ctx, data) => {
    const etupay = require('node-etupay')(providerConfig);
    const Basket = etupay.Basket;

    const transaction = new ctx.Transaction({
        state: 'pending',
        amount: data.amount,
        user_id: data.buyer.id
    });

    await transaction.save();

    const basket = new Basket(
        `Rechargement ${config.merchantName}`,
        data.buyer.firstname,
        data.buyer.lastname,
        data.buyer.email,
        'checkout',
        transaction.get('id')
    );

    basket.addItem('Rechargement', data.amount, 1);

    return { type: 'url', res: basket.compute() };
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    callback() {
        const etupay = require('node-etupay')(providerConfig);

        const router = new express.Router();

        router.use(etupay.router);

        router.post('/', async (req, res) => {
            const { Transaction, Reload, GiftReload, PendingCardUpdate } = req.app.locals.models;

            const giftReloads = await GiftReload.fetchAll().then(
                grs => (grs && grs.length ? grs.toJSON() : [])
            );

            const transaction = await Transaction.where({ id: req.etupay.serviceData }).fetch({
                withRelated: ['user'],
                require: true
            });

            const amount = transaction.get('amount');

            transaction.set('transactionId', req.etupay.transactionId);
            transaction.set('state', req.etupay.step);

            if (req.etupay.paid) {
                const newReload = new Reload({
                    credit: amount,
                    type: 'card',
                    trace: transaction.get('id'),
                    point_id: req.point_id,
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
                    point_id: req.point_id,
                    buyer_id: transaction.get('user_id'),
                    seller_id: transaction.get('user_id')
                });

                const reloadGiftSave = reloadGiftAmount ? reloadGift.save() : Promise.resolve();

                const pendingCardUpdate = new PendingCardUpdate({
                    user_id: transaction.get('user_id'),
                    amount
                });

                await Promise.all([
                    newReload.save(),
                    transaction.save(),
                    pendingCardUpdate.save(),
                    transaction.related('user').save(),
                    reloadGiftSave
                ]);

                req.app.locals.modelChanges.emit('userCreditUpdate', {
                    id: transaction.get('user_id'),
                    pending: amount
                });
            }

            await transaction.save();

            res.json({});
        });

        return router;
    }
};
