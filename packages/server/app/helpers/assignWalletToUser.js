module.exports = async (ctx, { wallet, user }) => {
    const walletToAssign = await ctx.models.Wallet.where({ id: wallet.id }).fetch();

    walletToAssign.set('user_id', user.id);

    await walletToAssign.save();

    // Move the wallet memberships to the user memberships
    await ctx.models.Membership.where({ wallet_id: wallet.id }).save(
        { wallet_id: null, user_id: user.id },
        { patch: true, require: false }
    );

    return walletToAssign.toJSON();
};
