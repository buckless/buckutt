export const load = async ctx => {
    if (ctx.rootState.user.user) {
        const result = await ctx.dispatch('request/get', { url: 'history' }, { root: true });

        if (!result) {
            return;
        }

        ctx.dispatch('user/setUser', result.user, { root: true });
        ctx.commit('SET_HISTORY', result.history.filter(entry => !entry.isRemoved));
        ctx.commit('SET_PENDING', result.pending);
    }
};
