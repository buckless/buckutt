const express = require('express');
const asyncHandler = require('express-async-handler');
const config = require('server/app/config');
const ctx = require('server/app/utils/ctx');
const processReload = require('server/app/helpers/processReload');

const providerConfig = config.provider.etupay;

const onlinePayment = async (ctx, data) => {
    const etupay = require('node-etupay')(providerConfig);
    const Basket = etupay.Basket;

    const transaction = new ctx.models.Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
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

const generateRouter = () => {
    const etupay = require('node-etupay')(providerConfig);

    const router = new express.Router();

    router.post(
        '/',
        etupay.middleware,
        asyncHandler(async (req, res) => {
            const { Transaction } = req.app.locals.models;

            const transaction = await Transaction.where({ id: req.etupay.serviceData }).fetch();

            if (transaction && transaction.get('state') === 'pending') {
                transaction.set('transactionId', req.etupay.transactionId);
                transaction.set('state', req.etupay.step);

                await transaction.save();

                if (req.etupay.paid) {
                    await processReload(ctx(req), { transaction: transaction.toJSON() });
                }
            }

            return res.json({});
        })
    );

    return router;
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    callback: generateRouter()
};
