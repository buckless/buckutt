const createUser = require('@/helpers/createUser');

module.exports = async (ctx, { molToCheck, name, cateringId, clientTime }) => {
    const mol = await ctx.models.MeanOfLogin.where(molToCheck)
        .fetch({ withRelated: ['user'] })
        .then(mol => (mol ? mol.toJSON() : null));

    let buyer;

    if (!mol || !mol.user || !mol.user.id) {
        buyer = await createUser(
            ctx,
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

    await new ctx.models.Withdrawal({
        seller_id: ctx.user.id,
        buyer_id: buyer.id,
        point_id: ctx.point.id,
        name,
        cateringId,
        clientTime
    }).save();
};
