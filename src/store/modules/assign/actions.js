export const ticket = async (ctx, ticketNumber) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        userId: ctx.rootState.user.user.id,
        ticketNumber
    };

    const user = await ctx.dispatch('request/post', { url: 'assigner', body }, { root: true });

    if (!user) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    await ctx.dispatch('user/setUser', user, { root: true });

    if (user.token) {
        await ctx.dispatch('user/setToken', user.token, { root: true });
    }

    await ctx.dispatch('user/load', null, { root: true });

    ctx.dispatch(
        'notifications/send',
        { message: 'Le billet a bien été lié à votre compte' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};

export const card = async (ctx, physicalId) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        userId: ctx.rootState.user.user.id,
        physicalId
    };

    const user = await ctx.dispatch('request/post', { url: 'assigner', body }, { root: true });

    if (!user) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    await ctx.dispatch('user/setUser', user, { root: true });

    if (user.token) {
        await ctx.dispatch('user/setToken', user.token, { root: true });
    }

    await ctx.dispatch('user/load', null, { root: true });

    ctx.dispatch(
        'notifications/send',
        { message: 'Le support a bien été lié à votre compte' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};

export const block = async (ctx, cardId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer votre carte ?')) {
        return;
    }

    await ctx.dispatch('working/set', true, { root: true });

    await ctx.dispatch('request/put', { url: 'block' }, { root: true });
    await ctx.commit('user/BLOCK_CARD', cardId, { root: true });

    ctx.dispatch('notifications/send', { message: 'Le support a bien été bloqué' }, { root: true });

    await ctx.dispatch('working/set', false, { root: true });
};
