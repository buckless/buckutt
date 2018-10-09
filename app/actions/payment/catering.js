const createUser = require('@/helpers/createUser');
const APIError = require('@/utils/APIError');

module.exports = async (ctx, { molToCheck, name, cateringId, clientTime }) => {
    const mol = await ctx.models.MeanOfLogin.where(molToCheck)
        .fetch({ withRelated: ['user'] })
        .then(mol => (mol ? mol.toJSON() : null));

    let buyer;

    if (!mol || !mol.user || !mol.user.id) {
        // don't create a new account if the card was already assigned
        if (!ctx.event.useCardData) {
            throw new APIError(module, 400, 'Invalid buyer');
        }

        buyer = await createUser(
            ctx.models,
            ctx.event,
            ctx.user,
            ctx.point,
            {},
            [],
            [molToCheck],
            [ctx.event.defaultGroup_id],
            false,
            true,
            clientTime
        );
    } else {
        buyer = mol.user;
    }

    await ctx.models
        .Withdrawal({
            seller_id: ctx.user.id,
            buyer_id: buyer.id,
            point_id: ctx.point.id,
            name,
            cateringId,
            clientTime
        })
        .save();
};
