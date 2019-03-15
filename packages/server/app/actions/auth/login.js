const bcrypt = require('bcryptjs');
const { bookshelf } = require('server/app/db');
const generateToken = require('server/app/utils/generateToken');
const APIError = require('server/app/utils/APIError');

const validateLoginBody = body => {
    if (!body.mail && !body.wallet) {
        throw new APIError(module, 401, 'Login error: No username provided');
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
    let user;
    if (infos.mail) {
        user = await ctx.models.User.query(q =>
            q.where(bookshelf.knex.raw('lower(mail)'), '=', infos.mail)
        )
            .fetch({
                withRelated: ['rights', 'rights.period', 'wallets', 'wallets.ticket']
            })
            .then(user => (user ? user.toJSON() : null));
    } else {
        user = await ctx.models.Wallet.query(q =>
            q.where(bookshelf.knex.raw('lower(logical_id)'), '=', infos.wallet)
        )
            .fetch({
                require: true,
                withRelated: [
                    'user',
                    'user.rights',
                    'user.rights.period',
                    'user.wallets',
                    'user.wallets.ticket'
                ]
            })
            .then(mol => (mol ? mol.toJSON().user : null));
    }

    if (!user) {
        throw new APIError(module, 401, 'Login error: Wrong credentials');
    }

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

    return {
        user,
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
