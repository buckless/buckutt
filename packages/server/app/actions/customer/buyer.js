const { omit } = require('lodash');
const APIError = require('server/app/utils/APIError');

module.exports = async (ctx, { walletId }) => {
    const now = new Date();

    const wallet = await ctx.models.Wallet.where({
        logical_id: walletId,
        blocked: false
    })
        .fetch({
            withRelated: [
                'user',
                'user.memberships',
                'purchases',
                'purchases.price',
                'purchases.price.period',
                {
                    'user.memberships.period': q =>
                        q.where('start', '<=', now).where('end', '>=', now)
                }
            ]
        })
        .then(wallet => (wallet ? wallet.toJSON() : null));

    if (!wallet.id || !wallet.user.id) {
        throw new APIError(module, 404, 'User not found');
    }

    const user = {
        ...wallet.user,
        memberships: wallet.user.memberships.filter(membership => membership.period)
    };

    return omit(user, ['pin', 'password']);
};
