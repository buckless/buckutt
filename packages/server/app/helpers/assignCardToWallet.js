const getSupportDetails = require('server/app/helpers/getSupportDetails');

module.exports = async (ctx, { wallet, logicalId }) => {
    const walletToAssign = await ctx.models.Wallet.where({ id: wallet.id }).fetch();

    const supportDetails = await getSupportDetails(ctx, {
        logical_id: logicalId
    });

    walletToAssign.set('logical_id', supportDetails.logical_id);

    if (supportDetails.physical_id) {
        walletToAssign.set('physical_id', supportDetails.physical_id);
    }

    await walletToAssign.save();

    return walletToAssign.toJSON();
};
