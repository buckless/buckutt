const { knex } = require('server/app/db').bookshelf;
const rightsDetails = require('server/app/utils/rightsDetails');
const generateToken = require('server/app/utils/generateToken');
const APIError = require('server/app/utils/APIError');

const switchUser = async (ctx, { infos, errDetails }) => {
    const mol = await ctx.models.MeanOfLogin.query(q =>
        q.where(knex.raw('lower(data)'), '=', infos.data.toLowerCase().trim())
    )
        .where('type', 'in', infos.type.split(','))
        .where({ blocked: false })
        .fetch({
            require: true,
            withRelated: ['user', 'user.meansOfLogin', 'user.rights', 'user.rights.period']
        })
        .then(mol => (mol ? mol.toJSON() : null));

    if (!mol.user || !mol.user.id) {
        throw new APIError(module, 401, 'User not found', errDetails);
    }

    const user = mol.user;

    if (ctx.user.mail !== user.mail) {
        throw new APIError(module, 401, 'User not found', errDetails);
    }

    user.pin = '';
    user.password = '';

    const userRights = rightsDetails(user, ctx.point.id);

    user.canSell = userRights.sell;
    user.canReload = userRights.reload;
    user.canAssign = userRights.assign;
    user.canControl = userRights.control;

    return {
        user,
        token: generateToken({
            id: user.id,
            point: ctx.point.id,
            // will be used by middleware (else how could middleware know if pin or password ?)
            connectType: ctx.connectType
        })
    };
};

module.exports = {
    switchUser
};
