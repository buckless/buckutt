import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import App from './App';
import Nfc from './components/Nfc.vue';
import store from './store';
import router from './router';
import { getPlatform } from '../lib/platform';

function init() {
    Vue.config.productionTip = false;
    Vue.component('nfc', Nfc);

    if (process.env.NODE_ENV === 'production') {
        Raven.config(config.sentry)
            .addPlugin(RavenVue, Vue)
            .install();
    }

    /* eslint-disable no-new */
    window.app = new Vue({
        store,
        router,
        el: '#app',
        template: '<App/>',
        components: { App }
    });
}

if (process.env.TARGET === 'cordova') {
    document.addEventListener('deviceready', init, false);
} else {
    init();
}
