const bcrypt_ = require('bcryptjs');
const express = require('express');
const promisifyAll = require('util-promisifyall');
const APIError = require('../../../errors/APIError');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);

/**
 * ChangePin controller.
 */
const bcrypt = promisifyAll(bcrypt_);
const router = new express.Router();

router.put('/services/manager/changepin', (req, res, next) => {
    const models = req.app.locals.models;

    if (req.body.currentPin.length !== 4 && req.body.pin.length !== 4) {
        next(new APIError(module, 401, 'PINs has to be clear, not crypted'));
    }

    let cryptedPin;

    bcrypt
        .compareAsync(req.body.currentPin.toString(), req.user.pin)
        .then(
            match =>
                match
                    ? Promise.resolve()
                    : Promise.reject(new APIError(module, 401, 'PIN is wrong'))
        )
        .then(() => bcrypt.hash(req.body.pin, 10))
        .then(hash => {
            cryptedPin = hash;
            return models.User.where({ id: req.user.id }).fetch();
        })
        .then(user => {
            user.set('pin', cryptedPin);
            user.set('updated_at', new Date());

            return user.save();
        })
        .then(() => {
            log.info(`Change pin for user ${req.user.id}`, req.details);

            res
                .status(200)
                .json({ changed: true })
                .end()
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
