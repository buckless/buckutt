const faker = require('faker/locale/fr');
const bcrypt = require('bcryptjs');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const mailer = require('./mailer');
const username = require('./username');
const template = require('../mailTemplates');
const checkAnonymousAccount = require('./checkAnonymousAccount');
const checkTicket = require('./checkTicket');
const config = require('../../config');
const log = require('./log')(module);
const APIError = require('../errors/APIError');

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
    isWritten = false,
    clientTime,
    isFromAssigner
) {
    let newUser;
    let userName;
    let pin;
    let creditToAdd = 0;
    const molsToSkip = [];

    pin = user.pin || padStart(Math.floor(Math.random() * 10000), 4, '0');

    return checkTicket(models, meansOfLogin)
        .then(() => checkAnonymousAccount(models, meansOfLogin))
        .then(anonymousData => {
            const totalReloadsCredit = reloads.reduce((a, b) => a + b.credit, 0);
            creditToAdd = user.credit ? user.credit + totalReloadsCredit : totalReloadsCredit;
            let userCredit = isWritten ? creditToAdd : 0;

            if (anonymousData) {
                userCredit += anonymousData.credit;
            }

            const userData = {
                firstname: user.firstname || faker.name.firstName(),
                lastname: user.lastname || faker.name.lastName(),
                nickname: user.nickname || '',
                mail: user.mail || 'anon@anon.com',
                pin: user.cryptedPin || bcrypt.hashSync(pin),
                password: user.password || 'none',
                recoverKey: randomstring.generate(),
                credit: userCredit,
                isTemporary: false
            };

            if (anonymousData) {
                molsToSkip.push('cardId');
                newUser = new models.User({ id: anonymousData.id });
                return newUser.save(userData, { patch: true });
            }

            // Only set clientTime on user creation
            userData.clientTime = clientTime;
            newUser = new models.User(userData);
            return newUser.save();
        })
        .then(() => user.username || username(newUser.get('firstname'), newUser.get('lastname')))
        .then(username_ => {
            if (!username_) {
                return Promise.reject(
                    new APIError(module, 500, 'Username can not be generated', { body: req.body })
                );
            }

            userName = username_;

            // Remove old mols instead cardId (to keep clientTime)
            return models.MeanOfLogin.where('type', 'in', ['mail', 'username'])
                .where({
                    user_id: newUser.id
                })
                .destroy();
        })
        .then(() => {
            // Create requested mols
            const molsPromises = meansOfLogin
                .filter(mol => molsToSkip.indexOf(mol.type) === -1)
                .map(mol => {
                    if (isFromAssigner && mol.type === 'ticketId') {
                        mol.blocked = true;
                    }

                    return new models.MeanOfLogin({
                        type: mol.type,
                        data: mol.data,
                        physical_id: mol.physical_id,
                        blocked: mol.blocked,
                        user_id: newUser.id,
                        clientTime
                    }).save();
                });

            // Create standard mols
            if (user.mail) {
                molsPromises.push(
                    new models.MeanOfLogin({
                        type: 'mail',
                        data: newUser.get('mail'),
                        blocked: false,
                        user_id: newUser.id,
                        clientTime
                    }).save()
                );
            }

            molsPromises.push(
                new models.MeanOfLogin({
                    type: 'username',
                    data: userName,
                    blocked: false,
                    user_id: newUser.id,
                    clientTime
                }).save()
            );

            // Create reloads
            const reloadsPromises = reloads.map(reload =>
                new models.Reload({
                    credit: reload.credit,
                    type: reload.type || 'anon',
                    trace: reload.trace || 'anon',
                    point_id: point.id,
                    buyer_id: newUser.id,
                    seller_id: operator.id || newUser.id,
                    clientTime
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
                        seller_id: operator.id || newUser.id,
                        clientTime
                    }).save()
                );
            }

            // Add a PCU if the credit isn't written yet
            let pendingCardUpdate = Promise.resolve();
            if (!isWritten && creditToAdd > 0) {
                pendingCardUpdate = new models.PendingCardUpdate({
                    user_id: newUser.id,
                    amount: creditToAdd
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
