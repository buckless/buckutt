import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';

import app from './modules/app';
import changes from './modules/changes';
import notifications from './modules/notifications';
import register from './modules/register';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    modules: {
        app,
        changes,
        notifications,
        register
    }
});
