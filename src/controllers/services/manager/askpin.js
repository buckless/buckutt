const express = require('express');
const randomstring = require('randomstring');
const APIError = require('../../../errors/APIError');
const mailer = require('../../../lib/mailer');
const dbCatch = require('../../../lib/dbCatch');
const log = require('../../../lib/log')(module);
const { bookshelf } = require('../../../lib/bookshelf');
const template = require('../../../mailTemplates');
const config = require('../../../../config');

/**
 * Generate mail to send
 * @param  {String} mail User mail
 * @param  {String} key  Recover key
 * @return {Object}      Mail to send
 */
function generateMessage(mail, key) {
    const from = config.askpin.from;
    const to = mail;
    const subject = config.askpin.subject;
    const { html, text } = template('pinLink', {
        brandname: config.merchantName,
        link: `${config.urls.managerUrl}/forgot?key=${key}`
    });

    return {
        from,
        to,
        subject,
        html,
        text
    };
}

/**
 * AskPin controller.
 */
const router = new express.Router();

router.get('/services/manager/askpin', (req, res, next) => {
    const mail = req.query.mail;
    const models = req.app.locals.models;

    let user;

    models.User.query(q =>
        q.where(bookshelf.knex.raw('lower(mail)'), '=', mail.toLowerCase().trim())
    )
        .fetch()
        .then(user_ => {
            user = user_;

            if (!user) {
                return Promise.reject(new APIError(module, 404, 'Incorrect mail'));
            }

            user.set('recoverKey', randomstring.generate());

            return user.save();
        })
        .then(() => mailer.sendMail(generateMessage(mail, user.get('recoverKey'))))
        .then(() => {
            req.details.ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            req.details.mail = mail;
            req.details.user = user.id;

            log.info(`IP ${req.details.ip} asked pin reset for user ${user.id}`, req.details);

            res
                .status(200)
                .json({ success: true })
                .end();
        })
        .catch(err => dbCatch(module, err, next));
});

module.exports = router;
