import 'material-design-lite/material.min.js';
import 'material-design-lite/material.min.css';
import 'jquery-datetimepicker/build/jquery.datetimepicker.full.min.js';
import 'jquery-datetimepicker/jquery.datetimepicker.css';
import Chart  from 'chart.js/Chart.js';
import jQuery from 'jquery';

import Vue       from 'vue';
import VueRouter from 'vue-router';
import Vuex      from 'vuex';

Vue.use(VueRouter);
Vue.use(Vuex);

import Sidebar   from './components/Sidebar.vue';
import Dashboard from './components/Dashboard.vue';
import Devices   from './components/Devices.vue';
import Items     from './components/Items.vue';
import Treasury  from './components/Treasury.vue';
import Rights    from './components/Rights.vue';
import Periods   from './components/Periods.vue';
import { fetchPoints, fetchDevices, fetchPeriods, fetchArticles, fetchFundations } from './store/actions';

import store from './store/index';

window.jQuery = jQuery;
window.Chart  = Chart;
Chart.defaults.global.animation = false;

const router = new VueRouter();

const App = Vue.extend({
    store,
    components: { Sidebar },
    template: '<div><Sidebar></Sidebar><router-view></router-view></div>'
});

router.map({
    '/': {
        component: Dashboard
    },
    '/devices': {
        component: Devices
    },
    '/items': {
        component: Items
    },
    '/treasury': {
        component: Treasury
    },
    '/rights': {
        component: Rights
    },
    '/periods': {
        component: Periods
    }
});

router.start(App, '#app');

// Restore material components after page change
router.afterEach(() => {
    setTimeout(() => {
        componentHandler.upgradeAllRegistered();
    });
});

fetchPoints(router.app.$store);
fetchDevices(router.app.$store);
fetchPeriods(router.app.$store);
fetchArticles(router.app.$store);
fetchFundations(router.app.$store);

window.router = router;
