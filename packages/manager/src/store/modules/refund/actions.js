export const registerCard = async ctx => {
    const body = {
        walletId: ctx.rootState.user.currentWallet
    };

    const data = await ctx.dispatch(
        'request/post',
        { url: 'payment/cardRegister', body },
        { root: true }
    );

    if (data && data.type === 'url') {
        window.location.href = data.res;
    }

    await ctx.dispatch('working/set', false, { root: true });
};

export const canRefund = async ctx => {
    const infos = await ctx.dispatch(
        'request/get',
        { url: `payment/infos?wallet_id=${ctx.rootState.user.currentWallet}` },
        { root: true }
    );

    if (!infos) {
        return;
    }

    ctx.commit('SET_ALLOWED', infos.refunds.allowed);
    ctx.commit('SET_ALREADY_ASKED', infos.refunds.alreadyAsked);
    ctx.commit('SET_REFUNDABLE', infos.refunds.refundable);
    ctx.commit('SET_START', infos.refunds.start);
    ctx.commit('SET_END', infos.refunds.end);
    ctx.commit('SET_MINIMUM', infos.refunds.minimum);
    ctx.commit('SET_CARD_REGISTERED', infos.refunds.cardRegistered);
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

    if (refundable && refundable.type === 'url') {
        window.location.href = refundable.res;
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
