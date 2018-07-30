const bcrypt_ = require('bcryptjs');
const express = require('express');
const promisifyAll = require('util-promisifyall');
const log = require('../../../lib/log')(module);
const dbCatch = require('../../../lib/dbCatch');
const APIError = require('../../../errors/APIError');

/**
 * Transfer controller. Handles transfer between accounts
 */
const bcrypt = promisifyAll(bcrypt_);
const router = new express.Router();

// Get the reciever user
router.post('/services/manager/transfer', (req, res, next) => {
    req.reciever_id = req.body.reciever_id;

    if (!req.reciever_id) {
        return next(new APIError(module, 400, 'Invalid reciever', { receiver: req.reciever_id }));
    }

    req.app.locals.models.User.where({ id: req.reciever_id })
        .fetch()
        .then(user => {
            if (!user) {
                return next(new APIError(module, 400, 'Invalid reciever'));
            }

            req.recieverUser = user.toJSON();
            next();
        })
        .catch(() => next(new APIError(400, 'Invalid reciever')));
});

router.post('/services/manager/transfer', (req, res, next) => {
    if (!req.body.currentPin) {
        return next(new APIError(module, 400, 'Current PIN has to be sent'));
    }

    if (req.body.currentPin.length !== 4) {
        return next(new APIError(module, 400, 'Current PIN has to be clear, not crypted'));
    }

    bcrypt.compareAsync(req.body.currentPin.toString(), req.user.pin).then(match => {
        if (match) {
            next();
        } else {
            next(new APIError(module, 400, 'Current PIN is wrong'));
        }
    });
});

router.post('/services/manager/transfer', (req, res, next) => {
    const models = req.app.locals.models;

    const amount = parseInt(req.body.amount, 10);

    if (req.user.credit - amount < 0) {
        return next(
            new APIError(module, 400, 'Not enough sender credit', {
                sender: req.sender_id,
                credit: req.user.credit,
                amount
            })
        );
    }

    if (req.recieverUser.credit + amount > 100 * 100) {
        return next(
            new APIError(module, 400, 'Too much reciever credit', {
                receiver: req.reciever_id,
                credit: req.user.credit,
                amount
            })
        );
    }

    if (req.user.id === req.recieverUser.id) {
        return res
            .status(200)
            .json({ newCredit: req.user.credit })
            .end();
    }

    const newTransfer = new models.Transfer({
        amount
    });

    newTransfer.set('sender_id', req.user.id);
    newTransfer.set('reciever_id', req.recieverUser.id);

    const updateSender = new models.PendingCardUpdate({
        user_id: req.user.id,
        amount: -1 * amount
    });

    const updateReciever = new models.PendingCardUpdate({
        user_id: req.recieverUser.id,
        amount
    });

    return Promise.all([updateSender.save(), updateReciever.save(), newTransfer.save()])
        .then(() => {
            req.app.locals.pub.publish(
                'userCreditUpdate',
                JSON.stringify({
                    id: req.user.id,
                    credit: null,
                    pending: -1 * amount
                })
            );

            req.app.locals.pub.publish(
                'userCreditUpdate',
                JSON.stringify({
                    id: req.recieverUser.id,
                    credit: null,
                    pending: amount
                })
            );

            req.details.user1 = req.user.id;
            req.details.user2 = req.body.reciever_id;
            req.details.amount = amount;
            log.info(
                `User ${req.user.id} transferred ${amount} to ${req.body.reciever_id}`,
                req.details
            );

            return res
                .status(200)
                .json({
                    newCredit: req.user.credit - amount
                })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
