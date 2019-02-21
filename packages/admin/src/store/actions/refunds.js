/**
 * Refunds actions
 */

export function refundUser({ state, dispatch }, refundData) {
    let refundedUser = refundData.user;

    return dispatch('syncFocusedElement', {
        depth: 0,
        route: 'users',
        id: refundedUser.id
    })
        .then(user => {
            refundedUser = user;

            if (refundData.refund.amount > refundedUser.credit) {
                return Promise.reject(new Error("The user doesn't have enough credit"));
            }

            const refund = {
                amount: refundData.refund.amount,
                trace: refundData.refund.trace,
                type: refundData.refund.type,
                seller_id: state.app.loggedUser.id,
                buyer_id: refundedUser.id
            };

            return dispatch('createObject', {
                route: 'refunds',
                value: refund
            });
        })
        .then(() => {
            const modifiedUser = {
                id: refundedUser.id,
                credit: refundedUser.credit - refundData.refund.amount
            };

            return dispatch('updateObject', {
                route: 'users',
                value: modifiedUser
            });
        });
}
