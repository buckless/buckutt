const express = require('express');
const createUser = require('../../../lib/createUser');
const dbCatch = require('../../../lib/dbCatch');
const APIError = require('../../../errors/APIError');

/**
 * Register controller. Handles manager account creation
 */
const router = new express.Router();

router.post('/services/manager/register', (req, res, next) => {
    const newUser = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        mail: req.body.mail
    };

    return req.app.locals.models.MeanOfLogin.where('type', 'in', ['mail'])
        .where('data', 'in', [req.body.mail])
        .where({ blocked: false })
        .fetchAll()
        .then(mols => {
            if (mols.length > 0) {
                return Promise.reject(new APIError(module, 404, 'User exists', { body: req.body }));
            }

            return createUser(
                req.app.locals.models,
                req.event,
                req.user,
                req.point,
                newUser,
                [],
                [],
                [req.event.defaultGroup_id],
                true,
                false
            );
        })
        .then(() =>
            res
                .status(200)
                .json({})
                .end()
        )
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
