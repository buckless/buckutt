const express = require('express');
const assignParser = require('../../../lib/assignParser');
const createUser = require('../../../lib/createUser');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);
const APIError = require('../../../errors/APIError');

/**
 * Register controller. Handles manager account creation
 */
const router = new express.Router();

// Assign a card or a ticket to a new account
router.post('/services/manager/register', (req, res, next) => {
    assignParser(req)
        .then(registerData => {
            if (registerData.targetUser.id) {
                return Promise.reject(new APIError(module, 400, 'This user already exists'));
            }

            return createUser(
                req.app.locals.models,
                req.event,
                req.user,
                req.point,
                registerData.targetUser,
                registerData.reloads,
                registerData.meansOfLogin,
                registerData.groupsToAdd,
                true,
                req.point.name !== 'Internet', // if Internet (manager), create PCU, else (assigner) directly write
                req.body.clientTime
            );
        })
        .then(user => {
            req.details.date = user.created_at;
            req.details.user = {
                firstname: user.firstname,
                lastname: user.lastname,
                mail: user.mail
            };

            log.info(`Register user ${user.firstname} ${user.lastname}`, req.details);

            user.pin = '';
            user.password = '';

            res
                .status(200)
                .json(user)
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
