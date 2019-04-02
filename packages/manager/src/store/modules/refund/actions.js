export const canRefund = async ctx => {
    const refundable = await ctx.dispatch(
        'request/get',
        { url: `payment/accountRefund?wallet_id=${ctx.rootState.user.currentWallet}` },
        { root: true }
    );

    if (!refundable) {
        return;
    }

    ctx.commit('SET_ALLOWED', refundable.allowed);
    ctx.commit('SET_ALREADY_ASKED', refundable.alreadyAsked);
    ctx.commit('SET_REFUNDABLE', refundable.refundable);
    ctx.commit('SET_START', refundable.start);
    ctx.commit('SET_END', refundable.end);
    ctx.commit('SET_MINIMUM', refundable.minimum);
};

export const refund = async ctx => {
    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        wallet_id: ctx.rootState.user.currentWallet
    };

    const refundable = await ctx.dispatch(
        'request/post',
        { url: 'payment/accountRefund', body },
        { root: true }
    );

    if (!refundable) {
        await ctx.dispatch(
            'notification/send',
            { message: 'Remboursement impossible' },
            { root: true }
        );

        return false;
    }

    ctx.commit('SET_ALLOWED', refundable.allowed);
    ctx.commit('SET_ALREADY_ASKED', refundable.alreadyAsked);
    ctx.commit('SET_REFUNDABLE', refundable.refundable);
    ctx.commit('SET_START', refundable.start);
    ctx.commit('SET_END', refundable.end);
    ctx.commit('SET_MINIMUM', refundable.minimum);

    await ctx.dispatch('notification/send', { message: 'Remboursement effectué' }, { root: true });

    await ctx.dispatch('working/set', false, { root: true });
};
