import Vue from 'vue';
import Vuex from 'vuex';

import history from './modules/history';
import notifications from './modules/notifications';
import register from './modules/register';
import user from './modules/user';
import request from './modules/request';
import reload from './modules/reload';
import transfer from './modules/transfer';
import pin from './modules/pin';
import assign from './modules/assign';
import refund from './modules/refund';
import working from './modules/working';
import changes from './modules/changes';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        history,
        notifications,
        register,
        user,
        request,
        reload,
        transfer,
        pin,
        assign,
        refund,
        working,
        changes
    }
});
