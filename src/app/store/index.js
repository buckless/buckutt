import Vue from 'vue';
import Vuex from 'vuex';

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

Vue.use(Vuex);

const debug = process.env.NODE_ENV === 'development';

const store = new Vuex.Store({
    state: {
        isReloadOpen: false,
        meanOfPayment: 'card',
        paymentStatus: 'WAITING'
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
        treasury
    },
    strict: debug,
    plugins: debug ? [createLogger()] : []
});

if (module.hot) {
    // accept actions and mutations as hot modules
    module.hot.accept(
        [
            './modules/auth',
            './modules/basket',
            './modules/history',
            './modules/items',
            './modules/online',
            './modules/reload',
            './modules/ui'
        ],
        () => {
            console.log('Hot update triggered');
            const newAuth = require('./modules/auth').default;
            const newBasket = require('./modules/basket').default;
            const newHistory = require('./modules/history').default;
            const newItems = require('./modules/items').default;
            const newOnline = require('./modules/online').default;
            const newReload = require('./modules/reload').default;
            const newUi = require('./modules/ui').default;

            console.log(newOnline.mutations.SET_ONLINE);

            store.hotUpdate({
                modules: {
                    auth: newAuth,
                    basket: newBasket,
                    history: newHistory,
                    items: newItems,
                    online: newOnline,
                    reload: newReload,
                    ui: newUi
                }
            });

            setTimeout(() => {
                console.log(store);
            }, 2000);
        }
    );
}

export default store;
