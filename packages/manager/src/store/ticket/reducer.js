export const initialState = {
    isFetching: false,
    error: null,
    user: null,
    ticketsByWalletId: {}
};

export const reducer = {
    SET_IS_FETCHING(state, isFetching) {
        state.isFetching = isFetching;
    },

    SET_ERROR(state, error) {
        state.error = error;
    },

    SET_TICKETS(state, tickets) {
        state.ticketsByWalletId = tickets;
    },

    SET_TICKET(state, ticket) {
        state.ticketsByWalletId[state.activeWallet] = ticket;
    }
};
