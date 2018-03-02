import io from 'socket.io-client/dist/socket.io.slim';

export function initSocket({ commit, dispatch, state }, token) {
    commit('CHANGESOCKET', io('', {
        transportOptions: {
            polling: {
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    }));

    state.changes.socket.on('connected', () => {
        console.log('Connected');
        dispatch('registerUserCredit');
    });

    state.changes.socket.on('APIError', (error) => {
        console.error(error);
    });
}

export function registerUserCredit({ state, commit, dispatch }) {
    state.changes.socket.emit('userCredit');

    state.changes.socket.on('userCredit', (payload) => {
        if (typeof payload.credit === 'number') {
            dispatch('updateLoggedUserField', {
                field: 'credit',
                value: payload.credit
            });
        }

        if (typeof payload.pending === 'number') {
            commit('SET_PENDING_AMOUNT', payload.pending);
        }

        dispatch('loadHistory');
    });
}

export function closeSocket({ commit, state }) {
    if (state.changes.socket) {
        state.changes.socket.close();
    }

    commit('REMOVESOCKET');
}
