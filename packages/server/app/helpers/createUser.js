const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const config = require('server/app/config');
const log = require('server/app/log')(module);
const mailer = require('server/app/mailer');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, userToCreate, clientTime) => {
    const pin = userToCreate.pin || padStart(Math.floor(Math.random() * 10000), 4, '0');

    if (!userToCreate.firstname || !userToCreate.lastname) {
        throw new APIError(module, 400, 'Firstname and lastname are missing', { userToCreate });
    }

    if (!userToCreate.mail) {
        throw new APIError(module, 400, 'Mail is missing', { userToCreate });
    }

    if (!isEmail(userToCreate.mail)) {
        throw new APIError(module, 400, 'Invalid mail format', { userToCreate });
    }

    const userData = {
        firstname: userToCreate.firstname,
        lastname: userToCreate.lastname,
        nickname: userToCreate.nickname || '',
        mail: userToCreate.mail,
        pin: userToCreate.cryptedPin || bcrypt.hashSync(pin),
        password: userToCreate.password || 'none',
        recoverKey: randomstring.generate(),
        clientTime: clientTime || new Date(),
        isTemporary: false
    };

    const newUser = await new ctx.models.User(userData).save();

    await mailer
        .send({
            name: 'pinAssign',
            data: {
                pin,
                email: newUser.get('mail'),
                brandname: config.merchantName,
                link: `${config.urls.managerUrl}`
            },
            from: config.askpin.from,
            to: newUser.get('mail'),
            subject: `${config.merchantName} — ${config.assigner.subject}`
        })
        .catch(err => {
            const error = new Error('sendMail failed');
            error.stack += `\nCaused by:\n${err.stack}`;

            log.error(error);
        });

    return newUser.toJSON();
};
