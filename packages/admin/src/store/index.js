import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import * as getters from './getters';

import app from './modules/app';
import notifications from './modules/notifications';
import stats from './modules/stats';
import api from './modules/api';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        app,
        notifications,
        stats,
        api
    }
});
