import io from 'socket.io-client';

export function registerModels({ commit, state }, routes) {
    state.changes.socket.emit('listen', routes);

    state.changes.socket.on('listening', models => {
        const modelsToRoutes = {};

        models.forEach((model, index) => {
            console.log(`Listen to ${model} changes`);
            modelsToRoutes[model] = routes[index];
        });

        commit('ADDMODELSTOROUTES', modelsToRoutes);
    });
}

export function initListeners({ dispatch, state }) {
    state.changes.socket.on('create', doc => {
        const route = state.changes.modelsToRoutes[doc.model];
        const objects = Array.isArray ? doc.data.to : [doc.data.to];

        dispatch('checkAndAddObjects', { route, objects });
    });

    state.changes.socket.on('update', doc => {
        const route = state.changes.modelsToRoutes[doc.model];
        dispatch('checkAndUpdateObjects', { route, objects: [doc.data.to] });
    });

    state.changes.socket.on('delete', doc => {
        const route = state.changes.modelsToRoutes[doc.model];
        dispatch('checkAndDeleteObjects', { route, objects: [doc.data.from] });
    });
}

export function initSocket({ commit, dispatch, state }, token) {
    commit(
        'CHANGESOCKET',
        io(config.api, {
            transportOptions: {
                polling: {
                    extraHeaders: {
                        Authorization: `Bearer ${token}`
                    }
                }
            }
        })
    );

    state.changes.socket.on('connected', () => {
        dispatch('initListeners');
    });

    state.changes.socket.on('APIError', error => {
        console.error(error);
    });
}

export function closeSocket({ commit, state }) {
    state.changes.socket.close();

    commit('REMOVESOCKET');
}
