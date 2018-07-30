let changes;

export function initSocket({ commit, dispatch, state }, token) {
    console.log('INIT', token);
    if (changes && typeof changes.close === 'function') {
        changes.close();
    }

    changes = new EventSource(
        `/live/credit?authorization=Bearer ${token}&fingerprint=manager&handshake-interval=10000&lastEventId=12345&retry=3000`
    );

    changes.socket.on('message', e => {
        try {
            const data = JSON.parse(e.data);

            if (typeof data.credit === 'number') {
                dispatch('updateLoggedUserField', {
                    field: 'credit',
                    value: data.credit
                });
            }

            if (typeof data.pending === 'number') {
                commit('SET_PENDING_AMOUNT', data.pending);
            }
        } catch (err) {
            console.error('invalid model detected', e.data, err);
        }

        dispatch('loadHistory');
    });
}

export function closeSocket() {
    changes.close();
}
