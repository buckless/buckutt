export const load = async ctx => {
    if (ctx.rootState.user.user) {
        const result = await ctx.dispatch(
            'request/get',
            { url: 'account/history' },
            { root: true }
        );

        if (!result) {
            return;
        }

        ctx.dispatch(
            'user/setUser',
            { ...ctx.rootState.user.user, ...result.user },
            { root: true }
        );
        ctx.commit('SET_HISTORY', result.history);
        ctx.commit('SET_PENDING', result.pending);
    }
};
