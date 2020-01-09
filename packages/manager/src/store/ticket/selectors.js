export const getIsFetching = state => state.isFetching;

export const getError = state => state.error;

export const getTickets = state => Object.values(state.ticketsByWalletId);

export const getActiveTicket = state => {
    if (!state.activeWallet) {
        return null;
    }

    return state.ticketsByWalletId[state.activeWallet];
};
