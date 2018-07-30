import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';

import app from './modules/app';
import notifications from './modules/notifications';
import register from './modules/register';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    modules: {
        app,
        notifications,
        register
    }
});
