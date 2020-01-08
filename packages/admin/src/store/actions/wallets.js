/**
 * Wallets actions
 */

export const reloadWallet = async ({ state, dispatch, getters }, reloadData) => {
    const refundedWallet = await dispatch('retrieveObject', {
        route: 'wallets',
        id: reloadData.wallet.id
    });

    const reload = {
        credit: reloadData.reload.credit,
        trace: reloadData.reload.trace,
        type: reloadData.reload.type,
        seller_id: state.app.loggedUser.id,
        wallet_id: refundedWallet.id,
        point_id: getters.internetPoint.id
    };

    await dispatch('createObject', {
        route: 'reloads',
        value: reload
    });

    await dispatch('creditWallet', {
        wallet: refundedWallet,
        credit: reload.credit
    });

    return dispatch('loadWalletHistory', refundedWallet);
};

export const refundWallet = async ({ state, dispatch, getters }, refundData) => {
    const refundedWallet = await dispatch('retrieveObject', {
        route: 'wallets',
        id: refundData.wallet.id
    });

    if (refundData.refund.amount > refundedWallet.credit) {
        return Promise.reject(new Error("The wallet doesn't have enough credit"));
    }

    const refund = {
        amount: refundData.refund.amount,
        trace: refundData.refund.trace,
        type: refundData.refund.type,
        seller_id: state.app.loggedUser.id,
        wallet_id: refundedWallet.id,
        point_id: getters.internetPoint.id
    };

    await dispatch('createObject', {
        route: 'refunds',
        value: refund
    });

    await dispatch('creditWallet', {
        wallet: refundedWallet,
        credit: -1 * refund.amount
    });

    return dispatch('loadWalletHistory', refundedWallet);
};

export const creditWallet = async ({ dispatch }, data) => {
    await dispatch('createObject', {
        route: 'pendingcardupdates',
        value: {
            amount: data.credit,
            wallet_id: data.wallet.id
        }
    });

    return dispatch('updateObject', {
        route: 'wallets',
        value: {
            id: data.wallet.id,
            credit: data.wallet.credit + data.credit
        }
    });
};
