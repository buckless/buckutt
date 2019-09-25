/**
 * Refunds actions
 */

export const refundWallet = async ({ state, dispatch, getters }, refundData) => {
    await dispatch('retrieveObject', { route: 'wallets', id: refundData.wallet.id });

    const refundedWallet = state.api.wallets.values[refundData.wallet.id];

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

    return dispatch('loadWalletHistory', refundedWallet);
};
