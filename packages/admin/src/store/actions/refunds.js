/**
 * Refunds actions
 */

export function refundWallet({ state, dispatch }, refundData) {
    let refundedWallet = refundData.wallet;

    return dispatch('syncFocusedElement', {
        depth: 0,
        route: 'wallets',
        id: refundedWallet.id
    })
        .then(wallet => {
            refundedWallet = wallet;

            if (refundData.refund.amount > refundedWallet.credit) {
                return Promise.reject(new Error("The wallet doesn't have enough credit"));
            }

            const refund = {
                amount: refundData.refund.amount,
                trace: refundData.refund.trace,
                type: refundData.refund.type,
                seller_id: state.app.loggedUser.id,
                wallet_id: refundedWallet.id,
                point_id: state.objects.points.find(point => point.name === 'Internet').id
            };

            return dispatch('createObject', {
                route: 'refunds',
                value: refund
            });
        })
        .then(() => {
            const modifiedWallet = {
                id: refundedWallet.id,
                credit: refundedWallet.credit - refundData.refund.amount
            };

            return dispatch('updateObject', {
                route: 'wallets',
                value: modifiedWallet
            });
        });
}
