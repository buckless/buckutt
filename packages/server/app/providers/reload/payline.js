const Payline = require('payline');
const path = require('path');
const moment = require('moment');
const config = require('server/app/config');
const APIError = require('server/app/utils/APIError');
const processReload = require('server/app/helpers/processReload');
const ctx = require('server/app/utils/ctx');

const providerConfig = config.provider.payline;

const wsdl =
    process.env.NODE_ENV !== 'dev'
        ? path.join(__dirname, 'utils', 'WebPaymentAPI.v4.55.wsdl')
        : null;
const ns = type => ({ xsi_type: { type, xmlns: 'http://obj.ws.payline.experian.com' } });
const currencies = { eur: 978 };
const actions = { authorization: 100, payment: 101, information: 108, refund: 421, credit: 422 };
const modes = { full: 'CPT', differed: 'DIF', nInstalments: 'NX', recurring: 'REC' };
const dateFormat = 'DD/MM/YYYY HH:mm';

const onlinePayment = async (ctx, data) => {
    const payline = new Payline(providerConfig.id, providerConfig.password, wsdl);
    const type = data.type || 'reload';

    const transaction = new ctx.models.Transaction({
        state: 'pending',
        amount: data.amount,
        wallet_id: data.wallet.id,
        user_id: data.buyer.id,
        isAuthorization: type === 'refund'
    });

    await transaction.save();

    const order = {
        version: 20,
        payment: {
            attributes: ns('payment'),
            amount: type === 'refund' ? '' : data.amount,
            currency: currencies.eur,
            action: type === 'refund' ? actions.information : actions.payment,
            mode: modes.full,
            contractNumber: providerConfig.contractNumber
        },
        returnURL: `${config.urls.managerUrl}/${type}/success`,
        cancelURL: `${config.urls.managerUrl}/${type}/failed`,
        order: {
            attributes: ns('order'),
            ref: transaction.get('id'),
            country: 'FR',
            amount: data.amount,
            currency: currencies.eur,
            date: moment().format(dateFormat)
        },
        notificationURL: `${config.urls.managerUrl}/api/provider/callback`,
        selectedContractList: {
            attributes: ns('selectedContractList'),
            selectedContract: providerConfig.contractNumber
        },
        buyer: {
            attributes: ns('buyer'),
            firstName: data.buyer.firstname,
            lastName: data.buyer.lastname,
            email: data.buyer.mail
        },
        merchantName: config.merchantName
    };

    const result = await payline.runAction('doWebPayment', order);

    return {
        type: 'url',
        res: result.redirectURL
    };
};

module.exports = {
    setup(req, _, next) {
        req.onlinePayment = data => onlinePayment(ctx(req), data);
        next();
    },

    async callback(req, res) {
        const payline = new Payline(providerConfig.id, providerConfig.password, wsdl);
        const { Transaction } = req.app.locals.models;

        const isNotification =
            req.query.notificationType && req.query.notificationType === 'webtrs';
        const token = req.query.token;

        if (!token || token.length < 1) {
            throw new APIError(module, 400, 'No token provided');
        }

        const paymentDetails = await payline.runAction('getWebPaymentDetails', {
            version: 21,
            token
        });

        if (
            ['PENDING_RISK', 'ONHOLD_PARTNER', 'INPROGRESS'].indexOf(
                paymentDetails.result.shortMessage
            ) > -1
        ) {
            return res.json({});
        }

        const transaction = await Transaction.where({ id: paymentDetails.order.ref }).fetch();

        if (transaction.get('state') !== 'pending') {
            throw new APIError(module, 403, 'This transaction has been already processed');
        }

        transaction.set('transactionId', paymentDetails.transaction.id);
        transaction.set('state', paymentDetails.result.shortMessage);
        transaction.set('longState', paymentDetails.result.longMessage);
        transaction.set('cardToken', paymentDetails.card.token);
        transaction.set('cardExpiration', paymentDetails.card.expirationDate);
        transaction.set('cardType', paymentDetails.card.type);

        await transaction.save();

        if (transaction.get('state') === 'ACCEPTED') {
            await processReload(ctx(req), { transaction: transaction.toJSON() });
        }

        return isNotification
            ? res.json({})
            : res.redirect(`${config.urls.managerUrl}/#/reload/success`);
    }
};
