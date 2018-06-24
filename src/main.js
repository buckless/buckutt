import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import NFC from './lib/nfc';

Vue.config.productionTip = false;

Vue.filter('price', (price, divide) => {
    if (!price) {
        return '0.00€';
    }

    const newCredit = (divide ? price / 100 : price).toFixed(2);

    return `${newCredit}€`;
});

window.app = new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');

window.nfc = new NFC();

// force / as initial URL on cordova
Vue.nextTick(() => {
    app.$router.replace('/');
});
