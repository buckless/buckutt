import 'promise-polyfill';
import 'whatwg-fetch';

import Vue from 'vue';

import App from './App';
import store from './store/index';
import router from './router';
import PaginatedTable from './components/PaginatedTable.vue';

import './fonts.css';

Vue.config.productionTip = false;

Vue.component('b-table', PaginatedTable);

store.dispatch('autoLoginUser');

window.app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
