module.exports = async (ctx, { wallet, user }) => {
    const assignedWallet = await new ctx.models.Wallet({
        id: wallet.id
    }).save(
        {
            user_id: user.id
        },
        {
            patch: true
        }
    );

    // Move the wallet memberships to the user memberships
    await ctx.models.Membership.where({ wallet_id: assignedWallet.id }).save(
        { wallet_id: null, user_id: user.id },
        { patch: true, require: false }
    );

    return assignedWallet.toJSON();
};
