import Vue from 'vue';
import Vuex from 'vuex';

import * as actions from './actions';
import * as getters from './getters';

import app from './modules/app';
import changes from './modules/changes';
import notifications from './modules/notifications';
import objects from './modules/objects';
import stats from './modules/stats';

Vue.use(Vuex);

export default new Vuex.Store({
    actions,
    getters,
    modules: {
        app,
        changes,
        notifications,
        objects,
        stats
    }
});
