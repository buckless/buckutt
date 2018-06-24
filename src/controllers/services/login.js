const promisifyAll = require('util-promisifyall');
const bcrypt = promisifyAll(require('bcryptjs'));
const express = require('express');
const log = require('../../lib/log')(module);
const sanitizeUser = require('../../lib/sanitizeUser');
const dbCatch = require('../../lib/dbCatch');
const { bookshelf } = require('../../lib/bookshelf');
const generateToken = require('../../lib/generateToken');
const APIError = require('../../errors/APIError');

function validate(body) {
    if (!body.meanOfLogin) {
        throw new APIError(module, 401, 'Login error: No meanOfLogin provided');
    }

    if (!body.data) {
        throw new APIError(module, 401, 'Login error: No (meanOfLogin) data provided');
    }

    if (!body.password && !body.pin) {
        throw new APIError(module, 401, 'Login error: No password nor pin provided');
    }

    if (body.password && body.pin) {
        throw new APIError(module, 401, 'Login error: Password and pin provided');
    }

    if (!(body.hasOwnProperty('pin') ^ body.hasOwnProperty('password'))) {
        throw new APIError(
            module,
            401,
            'Login error: Wrong connect type (must be either pin or password)'
        );
    }
}

/**
 * Login controller. Connects a user
 */
const router = new express.Router();

router.post('/services/login', async (req, res, next) => {
    try {
        validate(req.body);
    } catch (err) {
        return next(err);
    }

    const models = req.app.locals.models;

    const connectType = req.body.hasOwnProperty('pin') ? 'pin' : 'password';
    const infos = {
        meanOfLogin: req.body.meanOfLogin.toString(),
        data: req.body.data
            .toString()
            .toLowerCase()
            .trim(),
        connectType
    };

    req.details.infos = infos;

    let user;
    let meanOfLogin;

    try {
        meanOfLogin = await models.MeanOfLogin.query(q =>
            q.where(bookshelf.knex.raw('lower(data)'), '=', infos.data)
        )
            .where('type', 'in', infos.meanOfLogin.split(','))
            .where({ blocked: false })
            .fetch({
                withRelated: ['user', 'user.meansOfLogin', 'user.rights', 'user.rights.period']
            })
            .then(mol => (mol ? mol.toJSON() : null));
    } catch (err) {
        return dbCatch(module, err, next);
    }

    if (!meanOfLogin || !meanOfLogin.user || !meanOfLogin.user.id) {
        return next(new APIError(module, 401, 'Login error: Wrong credentials'));
    }

    user = meanOfLogin.user;

    let match = false;

    if (connectType === 'pin') {
        try {
            match = await bcrypt.compareAsync(req.body.pin.toString(), user.pin);
        } catch (err) {
            return next(new APIError(module, 401, 'Login error: Wrong credentials', err));
        }
    } else if (connectType === 'password') {
        try {
            match = await bcrypt.compareAsync(req.body.password, user.password);
        } catch (err) {
            return next(new APIError(module, 401, 'Login error: Wrong credentials', err));
        }
    }

    if (!match) {
        return next(new APIError(module, 401, 'Login error: Wrong credentials'));
    }

    let users_;
    try {
        // fetch linked users (same mail)
        users_ = await models.User.where({ mail: user.mail }).fetchAll({
            withRelated: ['meansOfLogin']
        });
    } catch (err) {
        return dbCatch(module, err, next);
    }

    const users = users_.toJSON().map(u => ({
        id: u.id,
        firstname: u.firstname,
        lastname: u.lastname,
        credit: u.credit,
        username: (u.meansOfLogin.find(mol => mol.type === 'username') || {}).data
    }));

    user = sanitizeUser(user, req.point_id);

    log.info(
        `Login with mol ${infos.meanOfLogin}(${infos.data}) and ${infos.connectType}`,
        req.details
    );

    return res
        .status(200)
        .json({
            user,
            linkedUsers: users,
            token: generateToken({
                id: user.id,
                point: req.point.id,
                // Will be used by middleware (else how could middleware know if pin or password ?)
                connectType
            })
        })
        .end();
});

module.exports = router;
