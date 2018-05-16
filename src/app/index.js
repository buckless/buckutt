import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';

import App from './App';
import Nfc from './components/Nfc.vue';
import store from './store';
import { getPlatform } from '../lib/platform';

function init() {
    Vue.config.productionTip = false;
    Vue.component('nfc', Nfc);

    if (process.env.NODE_ENV === 'production') {
        Raven.config('https://28b38832484d4f22994e50c24d5d6a6a@sentry.io/1207636')
            .addPlugin(RavenVue, Vue)
            .install();
    }

    /* eslint-disable no-new */
    window.app = new Vue({
        store,
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
