const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../../../config');
const logger = require('../../../lib/log');
const rightsDetails = require('../../../lib/rightsDetails');
const dbCatch = require('../../../lib/dbCatch');
const { bookshelf } = require('../../../lib/bookshelf');
const APIError = require('../../../errors/APIError');

const log = logger(module);

/**
 * SearchUser controller.
 */
const router = new express.Router();

const tokenOptions = {
    expiresIn: '30d' // 30 days token
};

router.post('/services/manager/switchuser', (req, res, next) => {
    const infos = { type: req.body.meanOfLogin.toString(), data: req.body.data.toString() };
    log.info(`Switch to user ${infos.type}(${infos.data})`, infos);

    const errDetails = {
        mol: infos.type,
        point: req.Point_id
    };

    if (req.connectType !== 'pin') {
        return next(new APIError(module, 401, 'User not found', errDetails));
    }

    const secret = config.app.secret;

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

            return res
                .status(200)
                .json({
                    user,
                    token: jwt.sign(
                        {
                            id: user.id,
                            point: req.point,
                            event: req.event,
                            // Will be used by middleware (else how could middleware know if pin or password ?)
                            connectType: req.connectType
                        },
                        secret,
                        tokenOptions
                    )
                })
                .end();
        })
        .catch(err => {
            console.log(err);
            return Promise.reject(err);
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
