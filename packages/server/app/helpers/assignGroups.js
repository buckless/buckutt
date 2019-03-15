module.exports = async (ctx, { wallet, groups }) => {
    // Always priorise a user membership over a wallet membership
    return await Promise.all(
        groups.map(group =>
            new ctx.models.Membership({
                wallet_id: !wallet.user_id ? wallet.id : null,
                user_id: wallet.user_id,
                group_id: group,
                period_id: ctx.event.defaultPeriod_id
            }).save()
        )
    );
};
