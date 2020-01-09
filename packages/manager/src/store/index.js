import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

import notifications from './notifications';
import user from './user';
import reload from './reload';
import refund from './refund';
import history from './history';
import infos from './infos';
import register from './register';
import ticket from './ticket';
import transfer from './transfer';
import wallet from './wallet';

export const store = new Vuex.Store({
    modules: {
        notifications,
        user,
        reload,
        refund,
        history,
        infos,
        register,
        ticket,
        transfer,
        wallet
    }
});

if (process.env.NODE_ENV === 'development') {
    window.store = store;
}
