import i18n from '@/i18n';

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
        { message: i18n.t('dashboard.assign.confirmticket') },
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
        { message: i18n.t('dashboard.assign.confirmsupport') },
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
        { message: i18n.t('dashboard.assign.confirmcreate') },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};

export const block = async (ctx, logicalId) => {
    if (!window.confirm(i18n.t('dashboard.lock.question'))) {
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

    ctx.dispatch(
        'notifications/send',
        { message: i18n.t('dashboard.lock.confirmlock') },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};
