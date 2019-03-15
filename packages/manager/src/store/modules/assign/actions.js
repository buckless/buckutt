export const ticket = async (ctx, ticketNumber) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        walletId: ctx.rootState.user.currentWallet,
        ticketNumber
    };

    const wallet = await ctx.dispatch(
        'request/post',
        { url: 'auth/assignWallet', body },
        { root: true }
    );

    if (!wallet) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    ctx.commit('user/UPDATE_CURRENT_WALLET', wallet, { root: true });

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
        walletId: ctx.rootState.user.currentWallet,
        physicalId
    };

    const wallet = await ctx.dispatch(
        'request/post',
        { url: 'auth/assignWallet', body },
        { root: true }
    );

    if (!wallet) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    ctx.commit('user/UPDATE_CURRENT_WALLET', wallet, { root: true });

    await ctx.dispatch('user/load', null, { root: true });

    ctx.dispatch(
        'notifications/send',
        { message: 'Le support a bien été lié à votre porte-monnaie' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};

export const create = async (ctx, physicalId) => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        physicalId,
        userId: ctx.rootState.user.user.id
    };

    const wallet = await ctx.dispatch(
        'request/post',
        { url: 'auth/assignCard', body },
        { root: true }
    );

    if (!wallet) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    ctx.commit('user/ADD_WALLET', wallet, { root: true });

    await ctx.dispatch('user/load', null, { root: true });

    ctx.dispatch(
        'notifications/send',
        { message: 'Le porte-monnaie a bien été créé' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};

export const block = async (ctx, logicalId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir bloquer votre carte ?')) {
        return;
    }

    const currentWallet = ctx.rootState.user.currentWallet;

    await ctx.dispatch('working/set', true, { root: true });

    await ctx.dispatch(
        'request/put',
        { url: `account/block?wallet=${currentWallet}` },
        { root: true }
    );
    await ctx.commit('user/BLOCK_CARD', logicalId, { root: true });

    ctx.dispatch('notifications/send', { message: 'Le support a bien été bloqué' }, { root: true });

    await ctx.dispatch('working/set', false, { root: true });
};
