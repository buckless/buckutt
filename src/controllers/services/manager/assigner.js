const express = require('express');
const assignParser = require('../../../lib/assignParser');
const createUser = require('../../../lib/createUser');
const assignUser = require('../../../lib/assignUser');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);

/**
 * Assigner controller. Handles manager and assigner account assignment
 */
const router = new express.Router();

// Assign a card or a ticket to an existing account
router.post('/services/manager/assigner', (req, res, next) => {
    assignParser(req)
        .then(assignData => {
            if (assignData.targetUser.id) {
                return assignUser(
                    req.app.locals.models,
                    req.event,
                    req.user,
                    req.point,
                    assignData.targetUser.id,
                    assignData.reloads,
                    assignData.meansOfLogin,
                    assignData.groupsToAdd,
                    req.point.name !== 'Internet' // if Internet (manager), create PCU, else (assigner) directly write
                );
            }

            return createUser(
                req.app.locals.models,
                req.event,
                req.user,
                req.point,
                assignData.targetUser,
                assignData.reloads,
                assignData.meansOfLogin,
                assignData.groupsToAdd,
                !!assignData.targetUser.mail, // Only send a mail if the address is given
                req.point.name !== 'Internet' // if Internet (manager), create PCU, else (assigner) directly write
            );
        })
        .then(user => {
            req.details.date = user.created_at;
            req.details.user = {
                firstname: user.firstname,
                lastname: user.lastname,
                mail: user.mail
            };

            req.app.locals.modelChanges.emit('userCreditUpdate', {
                id: user.id
            });

            log.info(`Assign user ${user.firstname} ${user.lastname}`, req.details);

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
