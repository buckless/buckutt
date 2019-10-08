export const reload = async (ctx, { amount, cardToken }) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        amount: parseInt(amount * 100, 10),
        cardToken,
        walletId: ctx.rootState.user.currentWallet
    };

    const data = await ctx.dispatch(
        'request/post',
        { url: 'payment/reload', body },
        { root: true }
    );

    if (data && data.type === 'url') {
        window.location.href = data.res;
    }

    await ctx.dispatch('working/set', false, { root: true });
};

export const callback = async (ctx, { token }) => {
    await ctx.dispatch(
        'request/get',
        { url: `provider/callback?token=${token}&isNotification=1` },
        { root: true }
    );
};

export const canReload = async ctx => {
    const infos = await ctx.dispatch(
        'request/get',
        { url: `payment/infos?wallet_id=${ctx.rootState.user.currentWallet}` },
        { root: true }
    );

    if (!infos) {
        return;
    }

    ctx.commit('SET_START', infos.reloads.start);
    ctx.commit('SET_END', infos.reloads.end);
};
