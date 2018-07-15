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
import history from './modules/history';
import treasury from './modules/treasury';
import catering from './modules/catering';

Vue.use(Vuex);

const debug = process.env.NODE_ENV === 'development';

const vuexPersist = new VuexPersistence({
    strictMode: debug,
    storage: localForage,
    reducer: state => ({
        ...state,
        // do not restore online.status
        online: {
            offline: state.online.offline
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
        history,
        treasury,
        catering
    },
    strict: debug,
    plugins: debug ? [createLogger(), vuexPersist.plugin] : [vuexPersist.plugin]
});

if (module.hot) {
    // accept actions and mutations as hot modules
    module.hot.accept(
        [
            './modules/auth',
            './modules/basket',
            './modules/catering',
            './modules/history',
            './modules/items',
            './modules/online',
            './modules/reload',
            './modules/treasury',
            './modules/ui'
        ],
        () => {
            const newAuth = require('./modules/auth').default;
            const newBasket = require('./modules/basket').default;
            const newCatering = require('./modules/catering').default;
            const newHistory = require('./modules/history').default;
            const newItems = require('./modules/items').default;
            const newOnline = require('./modules/online').default;
            const newReload = require('./modules/reload').default;
            const newTreasury = require('./modules/treasury').default;
            const newUi = require('./modules/ui').default;

            store.hotUpdate({
                modules: {
                    auth: newAuth,
                    basket: newBasket,
                    catering: newCatering,
                    history: newHistory,
                    items: newItems,
                    online: newOnline,
                    reload: newReload,
                    treasury: newTreasury,
                    ui: newUi
                }
            });
        }
    );
}

export default store;
