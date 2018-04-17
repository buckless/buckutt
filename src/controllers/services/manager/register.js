const express = require('express');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const username = require('../../../lib/username');
const mailer = require('../../../lib/mailer');
const dbCatch = require('../../../lib/dbCatch');
const APIError = require('../../../errors/APIError');
const template = require('../../../mailTemplates');
const config = require('../../../../config');

/**
 * Register controller. Handles manager account creation
 */
const router = new express.Router();

router.post('/services/manager/register', (req, res, next) => {
    const { MeanOfLogin, User } = req.app.locals.models;

    let user;
    let userName;
    let pin;

    return MeanOfLogin.where('type', 'in', ['mail'])
        .where('data', 'in', [req.body.mail])
        .where({ blocked: false })
        .fetchAll()
        .then(mols => {
            if (mols.length > 0) {
                return Promise.reject(new APIError(module, 404, 'User exists', { body: req.body }));
            }

            return username(req.body.firstname, req.body.lastname);
        })
        .then((username_) => {
            if (!username_) {
                return Promise.reject(new APIError(module, 500, 'Username can not be generated', { body: req.body }));
            }

            userName = username_;

            pin = padStart(Math.floor(Math.random() * 10000), 4, '0');

            user = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                nickname: '',
                pin: bcrypt.hashSync(pin),
                password: 'none',
                recoverKey: randomstring.generate(),
                mail: req.body.mail,
                credit: 0,
                isTemporary: false
            });

            return user.save();
        })
        .then(() => {
            const mol = new MeanOfLogin({
                type: 'mail',
                data: req.body.mail,
                user_id: user.id
            });

            const usernameMol = new MeanOfLogin({
                type: 'username',
                data: userName,
                user_id: user.id
            });

            return Promise.all([mol.save(), usernameMol.save()]);
        })
        .then(() => {
            const from = config.askpin.from;
            const to = user.get('mail');
            const subject = config.assigner.subject;
            const { html, text } = template('pinAssign', {
                pin,
                brandname: config.assigner.merchantName,
                link: `${config.urls.managerUrl}`
            });

            return mailer.sendMail({
                from,
                to,
                subject,
                html,
                text
            });
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
