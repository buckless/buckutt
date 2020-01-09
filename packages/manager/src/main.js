import Vue from 'vue';
import App from './views/app/App';
import { router } from './router';
import { store } from './store';
import { i18n } from './locales';
import './registerServiceWorker';

Vue.config.productionTip = false;

new Vue({
    router,
    store,
    i18n,
    render: h => h(App),
    mounted() {
        store.dispatch('user/restoreSession');
    }
}).$mount('#app');
