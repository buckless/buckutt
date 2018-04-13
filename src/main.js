import 'promise-polyfill';
import 'whatwg-fetch';

import Vue from 'vue';

import App from './App';
import store from './store/index';
import router from './router';
import PaginatedTable from './components/PaginatedTable.vue';

import './fonts.css';
import price from './lib/price';

Vue.config.productionTip = false;

Vue.component('b-table', PaginatedTable);
Vue.filter('price', price);

store.dispatch('autoLoginUser');

window.app = new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
