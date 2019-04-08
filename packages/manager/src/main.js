import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'normalize.css';
import '@/lib/currency';
import '@/lib/date';
import './registerServiceWorker';
import i18n from './i18n';

Vue.config.productionTip = false;

const app = new Vue({
    router,
    store,
    i18n,
    render: h => h(App)
});

app.$mount('#app');

window.app = app;
