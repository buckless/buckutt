export const findUser = async (ctx, name) => {
    ctx.commit('SET_SELECTED_USER', null);

    name = encodeURIComponent(name);

    const url = `searchuser?name=${name}&limit=3`;

    const users = await ctx.dispatch('request/get', { url }, { root: true });

    ctx.commit('SET_SEARCH_RESULTS', users);
};

export const selectResult = async (ctx, user) => {
    ctx.commit('SET_SELECTED_USER', user);
};

export const clearResults = ctx => {
    ctx.commit('SET_SEARCH_RESULTS', []);
    ctx.commit('SET_SELECTED_USER', null);
};

export const transfer = async (ctx, { wallet, amount }) => {
    let message = '';

    if (!wallet || !wallet.id) {
        message = 'Veuillez sélectionner un destinataire';
    } else {
        amount = parseFloat(amount);

        if (!amount || Number.isNaN(amount)) {
            message = 'Le montant doit être supérieur à 0';
        }

        if (wallet.id === ctx.rootState.user.currentWallet.id) {
            message = "Impossible de s'envoyer de l'argent";
        }
    }

    if (message) {
        ctx.dispatch('notifications/send', { message }, { root: true });

        return false;
    }

    await ctx.dispatch('working/set', true, { root: true });

    const body = {
        amount: (amount * 100).toFixed(0),
        creditor_id: wallet.id,
        debitor_id: ctx.rootState.user.currentWallet
    };

    const result = await ctx.dispatch(
        'request/post',
        { url: 'payment/transfer', body },
        { root: true }
    );

    if (!result) {
        await ctx.dispatch('working/set', false, { root: true });
        return false;
    }

    // reload full history
    ctx.dispatch('history/load', null, { root: true });

    ctx.dispatch(
        'notifications/send',
        { message: 'Le virement a bien été effectué' },
        { root: true }
    );

    await ctx.dispatch('working/set', false, { root: true });
};
