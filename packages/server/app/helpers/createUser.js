const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const randomstring = require('randomstring');
const { padStart } = require('lodash');
const config = require('server/app/config');
const log = require('server/app/log')(module);
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, userToCreate, clientTime) => {
    const pin = padStart(Math.floor(Math.random() * 10000), 4, '0');

    if (!userToCreate.firstname || !userToCreate.lastname) {
        throw new APIError(module, 400, 'Firstname and lastname are missing', { userToCreate });
    }

    if (!userToCreate.mail) {
        throw new APIError(module, 400, 'Mail is missing', { userToCreate });
    }

    if (!isEmail(userToCreate.mail)) {
        throw new APIError(module, 400, 'Invalid mail format', { userToCreate });
    }

    if (!userToCreate.password) {
        throw new APIError(module, 400, 'Password is missing', { userToCreate });
    }

    const userData = {
        firstname: userToCreate.firstname,
        lastname: userToCreate.lastname,
        nickname: userToCreate.nickname || '',
        mail: userToCreate.mail,
        pin: bcrypt.hashSync(pin),
        password: bcrypt.hashSync(userToCreate.password),
        recoverKey: randomstring.generate(),
        clientTime: clientTime || new Date(),
        isTemporary: false
    };

    const newUser = await new ctx.models.User(userData).save();

    return newUser.toJSON();
};
