const express = require('express');
const config = require('../../../../config');
const log = require('../../../lib/log')(module);
const rightsDetails = require('../../../lib/rightsDetails');
const dbCatch = require('../../../lib/dbCatch');
const { bookshelf } = require('../../../lib/bookshelf');
const generateToken = require('../../../lib/generateToken');
const APIError = require('../../../errors/APIError');

/**
 * SearchUser controller.
 */
const router = new express.Router();

router.post('/services/manager/switchuser', (req, res, next) => {
    const infos = { type: req.body.meanOfLogin.toString(), data: req.body.data.toString() };

    const errDetails = {
        mol: infos.type,
        point: req.Point_id
    };

    if (req.connectType !== 'pin') {
        return next(new APIError(module, 401, 'User not found', errDetails));
    }

    req.app.locals.models.MeanOfLogin.query(q =>
        q.where(bookshelf.knex.raw('lower(data)'), '=', infos.data.toLowerCase().trim())
    )
        .where('type', 'in', infos.type.split(','))
        .where({ blocked: false })
        .fetch({
            withRelated: ['user', 'user.meansOfLogin', 'user.rights', 'user.rights.period']
        })
        .then(mol => (mol ? mol.toJSON() : null))
        .then(mol => {
            if (!mol || !mol.user || !mol.user.id) {
                return next(new APIError(module, 401, 'User not found', errDetails));
            }

            const user = mol.user;

            if (req.user.mail !== user.mail) {
                return next(new APIError(module, 401, 'User not found', errDetails));
            }

            user.pin = '';
            user.password = '';

            const userRights = rightsDetails(user, req.point_id);

            user.canSell = userRights.sell;
            user.canReload = userRights.reload;
            user.canAssign = userRights.assign;
            user.canControl = userRights.control;

            log.info(`User ${req.user.id} switched to user ${user.id}`, infos);

            return res
                .status(200)
                .json({
                    user,
                    token: generateToken({
                        id: user.id,
                        point: req.point.id,
                        // Will be used by middleware (else how could middleware know if pin or password ?)
                        connectType: req.connectType
                    })
                })
                .end();
        })
        .catch(err => {
            return Promise.reject(err);
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
