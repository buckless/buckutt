const creditWallet = require('server/app/helpers/creditWallet');

module.exports = async (ctx, { onlineWallet, cardWallet }) => {
    // Merge informations from the anonymous card wallet to the online wallet
    // As a cardWallet is necessary unlinked to an user, it only has memberships, purchases, withdrawals & reloads
    const models = ['Withdrawal', 'Reload', 'Purchase', 'Ticket', 'Membership'];

    await Promise.all(
        models.map(model =>
            ctx.models[model].where({ wallet_id: cardWallet.id }).save(
                { wallet_id: onlineWallet.id },
                {
                    patch: true,
                    require: false
                }
            )
        )
    );

    // TODO: remove the duplicate default group membership.

    // Inhibate PCU creation as the cardWallet credit is already written on the card
    await creditWallet(ctx, onlineWallet.id, cardWallet.credit, true);

    // Destroy the old wallet
    await new ctx.models.Wallet({ id: cardWallet.id }).destroy();

    const mergedWallet = await ctx.models.Wallet.where({ id: onlineWallet.id }).fetch();

    return mergedWallet.toJSON();
};
