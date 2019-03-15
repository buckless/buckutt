export const load = async ctx => {
    const { user, currentWallet } = ctx.rootState.user;

    if (user && currentWallet) {
        const result = await ctx.dispatch(
            'request/get',
            { url: `account/history?wallet=${currentWallet}` },
            { root: true }
        );

        if (!result) {
            return;
        }

        ctx.dispatch('user/updateCurrentWallet', result.wallet, { root: true });
        ctx.commit('SET_HISTORY', result.history);
        ctx.commit('SET_PENDING', result.pending);
    }
};
