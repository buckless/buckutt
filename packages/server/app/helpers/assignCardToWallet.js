const getSupportDetails = require('server/app/helpers/getSupportDetails');

module.exports = async (ctx, { wallet, logicalId }) => {
    const supportDetails = await getSupportDetails(ctx, {
        logical_id: logicalId
    });

    const assignedWallet = await new ctx.models.Wallet({
        id: wallet.id
    }).save(supportDetails, {
        patch: true
    });

    return assignedWallet.toJSON();
};
