const { promisify } = require('util');
const connectSdk = require('connect-sdk-nodejs');
const config = require('@/config');
const log = require('@/log')(module);
const ctx = require('@/utils/ctx');
const APIError = require('@/utils/APIError');

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

const onlinePayment = async (ctx, data) => {
    const transaction = new ctx.Transaction({
        state: 'pending',
        amount: data.amount,
        user_id: data.buyer.id
    });

    await transaction.save();

    const order = {
        cardPaymentMethodSpecificInput: { skipAuthentication: true },
        order: {
            amountOfMoney: { currencyCode: 'EUR', amount: data.amount },
            customer: {
                billingAddress: { countryCode: 'FR' },
                contactDetails: { emailAddress: data.buyer.email },
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
                        amountOfMoney: { currencyCode: 'EUR', amount: data.amount },
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

    const result = await connectSdk.hostedcheckouts.create(providerConfig.merchantId, order, null);

    if (result.body.errors) {
        const errs = JSON.stringify(result.body.errors);

        throw new APIError(module, 500, 'epayments failed', errs);
    }

    transaction.set('transactionId', `${result.body.hostedCheckoutId}_${result.body.RETURNMAC}`);

    await transaction.save();

    return { type: 'url', res: `${providerConfig.urlPrefix}.${result.body.partialRedirectUrl}` };
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    async callback(req, res) {
        const { Transaction, Reload, PendingCardUpdate, GiftReload } = req.app.locals.models;

        const isNotification = req.query.isNotification;
        const hostedCheckoutId = req.query.hostedCheckoutId;
        const RETURNMAC = req.query.RETURNMAC;

        if (!hostedCheckoutId || hostedCheckoutId.length < 1) {
            throw new APIError(module, 400, 'No hostedCheckoutId provided');
        }

        if (!RETURNMAC || RETURNMAC.length < 1) {
            throw new APIError(module, 400, 'No RETURNMAC provided');
        }

        const result = await connectSdk.hostedcheckouts.get(
            providerConfig.merchantId,
            req.query.hostedCheckoutId,
            null
        );
        const paymentDetails = result.body;

        const giftReloads = await GiftReload.fetchAll().then(
            grs => (grs && grs.length ? grs.toJSON() : [])
        );

        const transaction = await Transaction.where({
            transactionId: `${req.query.hostedCheckoutId}_${req.query.RETURNMAC}`
        }).fetch({ withRelated: ['user'] });

        if (!transaction) {
            return isNotification
                ? res.status(404).json({})
                : res.redirect(`${config.urls.managerUrl}/reload/failed`);
        }

        const amount = transaction.get('amount');

        transaction.set('state', paymentDetails.createdPaymentOutput.paymentStatusCategory);
        transaction.set('longState', paymentDetails.createdPaymentOutput.payment.status);

        if (transaction.get('state') === 'SUCCESSFUL') {
            transaction.set('active', null);
            transaction.set('deleted_at', new Date());

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

        return isNotification
            ? res.json({})
            : res.redirect(`${config.urls.managerUrl}/reload/success`);
    }
};
