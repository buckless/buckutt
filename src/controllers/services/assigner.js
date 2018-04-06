const express      = require('express');
const bcrypt       = require('bcryptjs');
const { padStart } = require('lodash');
const mailer       = require('../../lib/mailer');
const dbCatch      = require('../../lib/dbCatch');
const fetchFromAPI = require('../../ticketProviders');
const APIError     = require('../../errors/APIError');
const template     = require('../../mailTemplates');
const config       = require('../../../config');

/**
 * Assigner controller. Handles cards assignment
 */
const router = new express.Router();

router.get('/services/assigner', (req, res, next) => {
    const ticketOrMail = req.query.ticketOrMail;

    if (!ticketOrMail || ticketOrMail.length === 0) {
        return next(new APIError(module, 400, 'Invalid ticketOrMail'));
    }

    const { MeanOfLogin, User, Reload } = req.app.locals.models;

    let user;
    let userData;
    let pin;
    let ticketId;

    MeanOfLogin
        .where('type', 'in', ['ticketId', 'mail'])
        .where({
            data   : ticketOrMail,
            blocked: false
        })
        .fetch({
            withRelated: ['user']
        })
        .then(mol => ((mol) ? mol.toJSON() : null))
        .then((mol) => {
            if (mol && mol.user.id) {
                if (req.user) {
                    return res
                        .status(200)
                        .json({
                            id    : mol.user.id,
                            credit: mol.user.credit,
                            name  : `${mol.user.firstname} ${mol.user.lastname}`
                        })
                        .end();
                }

                return res.status(404).json({}).end();
            }

            return fetchFromAPI(ticketOrMail)
                .then((userData_) => {
                    if (!userData_) {
                        const err = new APIError(module, 404, 'Couldn\'t find ticket', req.query.ticketOrMail);
                        return Promise.reject(err);
                    }

                    userData = userData_;
                    pin      = padStart(Math.floor(Math.random() * 10000), 4, '0');
                    ticketId = userData_.ticketId;

                    return MeanOfLogin
                        .where('type', 'in', ['ticketId', 'mail'])
                        .where('data', 'in', [ticketId, userData.mail])
                        .where({ blocked: false })
                        .fetchAll();
                })
                .then((mols) => {
                    if (mols.length > 0) {
                        return Promise.reject(new APIError(module, 404, 'Already assigned', { userData }));
                    }

                    pin = padStart(Math.floor(Math.random() * 10000), 4, '0');

                    userData.password = 'none';
                    userData.pin      = bcrypt.hashSync(pin);
                    userData.credit   = userData.credit || 0;

                    user = new User(userData);

                    return user.save();
                })
                .then(() => {
                    if (!config.assigner.sendPINMail) {
                        return Promise.resolve();
                    }

                    const from     = config.askpin.from;
                    const to       = user.get('mail');
                    const subject  = config.assigner.subject;
                    const { html, text } = template('pinAssign', {
                        pin,
                        brandname: config.provider.config.merchantName,
                        link     : `${config.urls.managerUrl}`
                    });

                    return mailer.sendMail({
                        from, to, subject, html, text
                    });
                })
                .then(() => {
                    const mailMol = new MeanOfLogin({
                        user_id: user.id,
                        type   : 'mail',
                        data   : user.get('mail'),
                        blocked: false
                    });

                    const ticketMol = new MeanOfLogin({
                        user_id: user.id,
                        type   : 'ticketId',
                        data   : ticketId,
                        blocked: false
                    });

                    const initialReload = new Reload({
                        credit   : user.get('credit'),
                        type     : 'initial',
                        trace    : ticketOrMail,
                        point_id : req.point_id,
                        buyer_id : user.id,
                        seller_id: user.id
                    });

                    return Promise.all([mailMol.save(), ticketMol.save(), initialReload.save()]);
                })
                .then(() => {
                    if (req.user) {
                        return res
                            .status(200)
                            .json({
                                id    : user.id,
                                credit: user.get('credit'),
                                name  : `${user.get('firstname')} ${user.get('lastname')}`
                            })
                            .end();
                    }

                    return res.status(200).json({}).end();
                });
        })
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/assigner/groups', (req, res, next) => {
    const userId = req.body.user;
    const groups = req.body.groups;

    if (!userId || userId.length === 0) {
        return next(new APIError(module, 400, 'Invalid user'));
    }

    if (!groups || !Array.isArray(groups)) {
        return next(new APIError(module, 400, 'Invalid groups'));
    }

    groups.push(req.event.defaultGroup_id);

    const Membership = req.app.locals.models.Membership;

    const memberships = groups.map((groupId) => {
        const membership = new Membership({
            user_id  : userId,
            group_id : groupId,
            period_id: req.event.defaultPeriod_id
        });

        return membership.save();
    });

    Promise.all(memberships)
        .then(() =>
            res
                .status(200)
                .json({})
                .end())
        .catch(err => dbCatch(module, err, next));
});

router.post('/services/assigner/anon', (req, res, next) => {
    const credit = req.body.credit;
    const groups = req.body.groups;
    const cardId = req.body.cardId;

    if (!cardId || cardId.length === 0) {
        return next(new APIError(module, 400, 'Invalid cardId'));
    }

    if (!Number.isInteger(credit)) {
        return next(new APIError(module, 400, 'Invalid credit'));
    }

    if (!groups || !Array.isArray(groups)) {
        return next(new APIError(module, 400, 'Invalid groups'));
    }

    groups.push(req.event.defaultGroup_id);

    const User        = req.app.locals.models.User;
    const Membership  = req.app.locals.models.Membership;
    const Reload      = req.app.locals.models.Reload;
    const MeanOfLogin = req.app.locals.models.MeanOfLogin;

    const user = new User({
        firstname: 'anon',
        lastname : 'anon',
        mail     : 'anon@anon.com',
        pin      : 'none',
        password : 'none',
        credit
    });

    user
        .save()
        .then(() => {
            const memberships = groups.map((groupId) => {
                const membership = new Membership({
                    user_id  : user.id,
                    group_id : groupId,
                    period_id: req.event.defaultPeriod_id
                });

                return membership.save();
            });

            const mol = new MeanOfLogin({
                type   : 'cardId',
                data   : cardId,
                blocked: false,
                user_id: user.id
            }).save();

            const reload = credit > 0
                ? new Reload({
                    credit,
                    type     : 'anon',
                    trace    : 'anon',
                    point_id : req.point_id,
                    buyer_id : user.id,
                    seller_id: req.user.id
                }).save()
                : Promise.resolve();

            return Promise.all(memberships.concat([reload, mol]));
        })
        .then(() =>
            res
                .status(200)
                .json({})
                .end())
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
