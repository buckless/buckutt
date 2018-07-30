const express = require('express');
const APIError = require('../../../errors/APIError');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);

/**
 * Account refund controller.
 */
const router = new express.Router();

const canRefund = async (req, res) => {
    const { Reload, Refund, PendingCardUpdate } = req.app.locals.models;

    const date = new Date();

    const start = req.event.accountRefundStart;
    const end = req.event.accountRefundEnd;

    const reloads = await Reload.where({ buyer_id: req.user.id }).fetchAll({
        withRelated: ['point']
    });
    const pendingCardUpdates = await PendingCardUpdate.where({ user_id: req.user.id }).fetchAll();
    const alreadyAsked = await Refund.where({
        type: 'card',
        trace: 'account-refund',
        buyer_id: req.user.id
    }).fetch();

    const maxRefund = reloads
        .toJSON()
        .filter(reload => reload.type === 'card' && reload.point.name === 'Internet')
        .map(reload => reload.credit)
        .reduce((a, b) => a + b, 0);
    const pendingCredit = pendingCardUpdates.toJSON().reduce((a, b) => a + b.amount, 0);

    const refundable = Math.min(maxRefund, req.user.credit + pendingCredit);

    const allowed =
        date >= start &&
        date <= end &&
        refundable >= req.event.minimumAccountRefund &&
        !alreadyAsked;

    return {
        allowed,
        start,
        end,
        alreadyAsked,
        pendingCredit,
        refundable: refundable,
        minimum: req.event.minimumAccountRefund
    };
};

router.get('/services/manager/accountRefund', async (req, res, next) => {
    let refund;

    try {
        refund = await canRefund(req);
    } catch (err) {
        return dbCatch(module, err, next);
    }

    res
        .status(200)
        .json({
            ...refund,
            minimum: req.event.minimumAccountRefund
        })
        .end();
});

router.post('/services/manager/accountRefund', async (req, res, next) => {
    let refundData;

    try {
        refundData = await canRefund(req);
    } catch (err) {
        return dbCatch(module, err, next);
    }

    if (!refundData.allowed) {
        return next(new APIError(module, 403, 'Not authorized to refund'));
    }

    const { Refund, User, PendingCardUpdate } = req.app.locals.models;
    const refund = new Refund({
        amount: refundData.refundable,
        type: 'card',
        trace: 'account-refund',
        buyer_id: req.user.id,
        seller_id: req.user.id
    });

    const newCredit = req.user.credit + refundData.pendingCredit - refundData.refundable;

    try {
        await User.where({ id: req.user.id }).save(
            { credit: newCredit },
            {
                patch: true,
                require: false
            }
        );

        await PendingCardUpdate.where({ user_id: req.user.id }).destroy();
        await refund.save();
    } catch (err) {
        return dbCatch(module, err, next);
    }

    req.app.locals.pub.publish(
        'userCreditUpdate',
        JSON.stringify({
            id: req.user.id,
            credit: newCredit,
            pending: null
        })
    );

    return res
        .status(200)
        .json({
            ...refundData,
            allowed: false,
            alreadyAsked: refund.toJSON(),
            minimum: req.event.minimumAccountRefund
        })
        .end();
});

module.exports = router;
