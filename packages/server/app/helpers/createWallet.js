const getSupportDetails = require('server/app/helpers/getSupportDetails');
const assignGroups = require('server/app/helpers/assignGroups');

module.exports = async (ctx, { logicalId, user, clientTime }) => {
    const supportDetails = await getSupportDetails(ctx, {
        logical_id: logicalId
    });

    const createdWallet = await new ctx.models.Wallet({
        ...supportDetails,
        user_id: user ? user.id : null,
        credit: 0,
        clientTime: clientTime || new Date()
    }).save();

    await assignGroups(ctx, {
        groups: [ctx.event.defaultGroup_id],
        wallet: createdWallet.toJSON()
    });

    return createdWallet.toJSON();
};
