const bcrypt = require('bcryptjs');
const { bookshelf } = require('@/db');
const generateToken = require('@/utils/generateToken');
const APIError = require('@/utils/APIError');

const validateLoginBody = body => {
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
};

const login = async (ctx, { infos, pin, password }) => {
    const meanOfLogin = await ctx.models.MeanOfLogin.query(q =>
        q.where(bookshelf.knex.raw('lower(data)'), '=', infos.data)
    )
        .where('type', 'in', infos.meanOfLogin.split(','))
        .where({ blocked: false })
        .fetch({
            require: true,
            withRelated: ['user', 'user.meansOfLogin', 'user.rights', 'user.rights.period']
        })
        .then(mol => (mol ? mol.toJSON() : null));

    if (!meanOfLogin.user || !meanOfLogin.user.id) {
        throw new APIError(module, 401, 'Login error: Wrong credentials');
    }

    const user = meanOfLogin.user;

    let match = false;

    if (infos.connectType === 'pin') {
        try {
            match = await bcrypt.compare(pin.toString(), user.pin);
        } catch (err) {
            throw new APIError(module, 401, 'Login error: Wrong credentials', err);
        }
    } else if (infos.connectType === 'password') {
        try {
            match = await bcrypt.compare(password, user.password);
        } catch (err) {
            throw new APIError(module, 401, 'Login error: Wrong credentials', err);
        }
    }

    if (!match) {
        throw new APIError(module, 401, 'Login error: Wrong credentials');
    }

    // fetch linked users (same mail)
    let linkedUsers = await ctx.models.User.where({ mail: user.mail }).fetchAll({
        withRelated: ['meansOfLogin']
    });

    linkedUsers = linkedUsers.toJSON().map(u => ({
        id: u.id,
        firstname: u.firstname,
        lastname: u.lastname,
        credit: u.credit,
        username: (u.meansOfLogin.find(mol => mol.type === 'username') || {}).data
    }));

    return {
        user,
        linkedUsers,
        token: generateToken({
            id: user.id,
            wiket: ctx.wiket.id,
            // will be used by middleware (else how could middleware know if pin or password ?)
            connectType: infos.connectType
        })
    };
};

module.exports = {
    validateLoginBody,
    login
};
