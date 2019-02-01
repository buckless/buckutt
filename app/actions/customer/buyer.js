const { omit } = require('lodash');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, { type, buyer }) => {
    const now = new Date();

    const mol = await ctx.models.MeanOfLogin.where({
        type,
        data: buyer,
        blocked: false
    })
        .fetch({
            require: true,
            withRelated: [
                'user',
                'user.memberships',
                'user.purchases',
                'user.purchases.price',
                'user.purchases.price.period',
                {
                    'user.memberships.period': q =>
                        q.where('start', '<=', now).where('end', '>=', now)
                }
            ]
        })
        .then(mol => (mol ? mol.toJSON() : null));

    if (!mol.user.id) {
        throw new APIError(module, 404, 'Buyer not found');
    }

    return omit(mol.user, ['pin', 'password']);
};
