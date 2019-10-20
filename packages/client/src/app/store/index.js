import Vue from 'vue';
import Vuex from 'vuex';
import VuexPersistence from 'vuex-persist';
import localForage from 'localforage';

import createLogger from 'vuex/dist/logger';

import * as actions from './actions';
import * as getters from './getters';

import auth from './modules/auth';
import items from './modules/items';
import reload from './modules/reload';
import ui from './modules/ui';
import basket from './modules/basket';
import online from './modules/online';
import device from './modules/device';
import healthAlerts from './modules/healthAlerts';

Vue.use(Vuex);

const debug = process.env.NODE_ENV === 'development';

const vuexPersist = new VuexPersistence({
    // see https://github.com/championswimmer/vuex-persist#support-strict-mode
    strictMode: true,
    storage: localForage,
    reducer: state => ({
        ...state,
        // do not restore online.status
        online: {
            offline: state.online.offline
        },
        device: {
            ...state.device,
            storeLoaded: false
        }
    })
});

const store = new Vuex.Store({
    state: {
        isReloadOpen: false,
        meanOfPayment: 'card',
        paymentStatus: 'WAITING'
    },
    mutations: {
        RESTORE_MUTATION: vuexPersist.RESTORE_MUTATION
    },
    actions,
    getters,
    modules: {
        auth,
        items,
        reload,
        ui,
        basket,
        online,
        device,
        healthAlerts
    },
    strict: debug,
    plugins: debug ? [createLogger(), vuexPersist.plugin] : [vuexPersist.plugin]
});

store.subscribe(mutation => {
    if (mutation.type === 'RESTORE_MUTATION') {
        window.config = store.state.device.config;
        store.dispatch('setupClient');
        store.commit('SET_STORE_LOADED', true);
    }
});

if (module.hot) {
    // accept actions and mutations as hot modules
    module.hot.accept(
        [
            './modules/auth',
            './modules/basket',
            './modules/items',
            './modules/online',
            './modules/reload',
            './modules/ui',
            './modules/device',
            './modules/healthAlerts'
        ],
        () => {
            const newAuth = require('./modules/auth').default;
            const newBasket = require('./modules/basket').default;
            const newItems = require('./modules/items').default;
            const newOnline = require('./modules/online').default;
            const newReload = require('./modules/reload').default;
            const newUi = require('./modules/ui').default;
            const newDevice = require('./modules/device').default;
            const newHealthAlerts = require('./modules/healthAlerts').default;

            store.hotUpdate({
                modules: {
                    auth: newAuth,
                    basket: newBasket,
                    items: newItems,
                    online: newOnline,
                    reload: newReload,
                    ui: newUi,
                    device: newDevice,
                    healthAlerts: newHealthAlerts
                }
            });
        }
    );
}

export default store;
