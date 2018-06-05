const faker = require('faker/locale/fr');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const mailer = require('./mailer');
const username = require('./username');
const template = require('../mailTemplates');
const config = require('../../config');
const log = require('./log')(module);

module.exports = function createUser(
    models,
    event,
    operator = {},
    point,
    user,
    reloads = [],
    meansOfLogin = [],
    groups = [],
    sendMail = true,
    isWritten = false
) {
    let newUser;
    let userName;
    let pin;

    pin = user.pin || padStart(Math.floor(Math.random() * 10000), 4, '0');

    const totalReloadsCredit = reloads.reduce((a, b) => a + b.credit, 0);
    const newCredit = user.credit ? user.credit + totalReloadsCredit : totalReloadsCredit;

    newUser = new models.User({
        firstname: user.firstname || faker.name.firstName(),
        lastname: user.lastname || faker.name.lastName(),
        nickname: user.nickname || '',
        mail: user.mail || faker.internet.email(),
        pin: bcrypt.hashSync(pin),
        password: user.password || 'none',
        recoverKey: randomstring.generate(),
        credit: newCredit,
        isTemporary: false
    });

    return newUser
        .save()
        .then(() => user.username || username(newUser.get('firstname'), newUser.get('lastname')))
        .then(username_ => {
            if (!username_) {
                return Promise.reject(
                    new APIError(module, 500, 'Username can not be generated', { body: req.body })
                );
            }

            userName = username_;

            // Create requested mols
            let molsPromises = meansOfLogin.map(mol =>
                new models.MeanOfLogin({
                    type: mol.type,
                    data: mol.data,
                    blocked: mol.blocked,
                    user_id: newUser.id
                }).save()
            );

            // Create standard mols
            const mailMol = new models.MeanOfLogin({
                type: 'mail',
                data: newUser.get('mail'),
                blocked: false,
                user_id: newUser.id
            });

            const usernameMol = new models.MeanOfLogin({
                type: 'username',
                data: userName,
                blocked: false,
                user_id: newUser.id
            });

            molsPromises = molsPromises.concat([mailMol.save(), usernameMol.save()]);

            // Create reloads
            const reloadsPromises = reloads.map(reload =>
                new models.Reload({
                    credit: reload.credit,
                    type: reload.type || 'anon',
                    trace: reload.trace || 'anon',
                    point_id: point.id,
                    buyer_id: newUser.id,
                    seller_id: operator.id || newUser.id
                }).save()
            );

            // Create a reload for the base credit
            if (user.credit > 0) {
                reloadsPromises.push(
                    new models.Reload({
                        credit: user.credit,
                        type: 'assigner',
                        trace: 'assigner',
                        point_id: point.id,
                        buyer_id: newUser.id,
                        seller_id: operator.id || newUser.id
                    }).save()
                );
            }

            // Add a PCU if the credit isn't written yet
            let pendingCardUpdate = Promise.resolve();
            if (!isWritten && newUser.get('credit') > 0) {
                pendingCardUpdate = new models.PendingCardUpdate({
                    user_id: newUser.id,
                    amount: newUser.get('credit')
                }).save();
            }

            // Add requested memberships
            const membershipsPromises = groups.map(group =>
                new models.Membership({
                    user_id: newUser.id,
                    group_id: group,
                    period_id: event.defaultPeriod_id
                }).save()
            );

            return Promise.all(
                molsPromises
                    .concat(reloadsPromises)
                    .concat(membershipsPromises)
                    .concat([pendingCardUpdate])
            );
        })
        .then(() => {
            if (sendMail) {
                const from = config.askpin.from;
                const to = newUser.get('mail');
                const subject = config.assigner.subject;
                const { html, text } = template('pinAssign', {
                    pin,
                    username: userName,
                    email: newUser.get('mail'),
                    brandname: config.merchantName,
                    link: `${config.urls.managerUrl}`
                });

                mailer
                    .sendMail({
                        from,
                        to,
                        subject,
                        html,
                        text
                    })
                    .catch(err => {
                        const error = new Error('sendMail failed');
                        error.stack += `\nCaused by:\n${err.stack}`;

                        log.error(error);
                    });
            }

            return Promise.resolve();
        })
        .then(() => newUser.toJSON());
};
