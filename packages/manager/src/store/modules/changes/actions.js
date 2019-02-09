export const init = (ctx, token) => {
    let source = ctx.state.source;

    if (source && typeof source.close === 'function') {
        source.close();
    }

    source = new EventSource(
        `/live/credit?authorization=Bearer ${token}&fingerprint=manager&handshake-interval=10000&lastEventId=12345&retry=3000`
    );

    ctx.commit('SET_SOURCE', source);

    source.addEventListener('message', e => {
        try {
            const data = JSON.parse(e.data);

            if (typeof data.credit === 'number') {
                ctx.dispatch(
                    'user/setUser',
                    {
                        ...ctx.rootState.user.user,
                        credit: data.credit
                    },
                    { root: true }
                );
            }

            if (typeof data.pending === 'number') {
                ctx.commit('user/SET_PENDING_AMOUNT', data.pending, { root: true });
            }
        } catch (err) {
            console.error('invalid model detected', e.data, err);
        }

        ctx.dispatch('history/load', null, { root: true });
    });
};

export const close = ctx => {
    ctx.state.source.close();
};
