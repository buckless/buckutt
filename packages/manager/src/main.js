import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import 'normalize.css';
import '@/lib/currency';
import '@/lib/date';
import './registerServiceWorker';

Vue.config.productionTip = false;

const app = new Vue({
    router,
    store,
    render: h => h(App)
});

app.$mount('#app');

window.app = app;
