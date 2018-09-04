import Vue from 'vue';
import Raven from 'raven-js';
import RavenVue from 'raven-js/plugins/vue';
import Instascan from 'instascan';

window.Instascan = Instascan;

import App from './App';
import Nfc from './components/Nfc.vue';
import store from './store';
import router from './router';

import '../lib/fingerprint';

function init() {
    Vue.config.productionTip = false;
    Vue.component('nfc', Nfc);

    if (process.env.NODE_ENV === 'production') {
        Raven.config(config.sentry)
            .addPlugin(RavenVue, Vue)
            .install();
    }

    /* eslint-disable no-new */
    const app = new Vue({
        router,
        store,
        render: h => h(App)
    });

    app.$mount('#app');

    window.app = app;
}

if (process.env.TARGET === 'cordova') {
    document.addEventListener('deviceready', init, false);
} else {
    init();
}
