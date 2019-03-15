import Vue from 'vue';
import Queue from '@buckless/offline-queue';
import axios_ from 'axios';
import App from './App.vue';
import router from './router';
import store from './store';
import NFC from './lib/nfc';
import generateSignature from './utils/generateSignature';

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

// API base
const axios = axios_.create({
    baseURL: process.env.VUE_APP_API,
    headers: {
        Accept: '',
        'Accept-Language': '',
        'X-fingerprint': 'admin'
    }
});

const logOperator = force => {
    if (localStorage.hasOwnProperty('masterapp-token') && !force) {
        return Promise.resolve();
    }

    const credentials = {
        mail: process.env.VUE_APP_OPERATOR_MAIL,
        password: process.env.VUE_APP_OPERATOR_PASSWORD
    };

    return axios.post('auth/login', credentials).then(res => {
        localStorage.setItem('masterapp-token', res.data.token);
    });
};

const fetchGroups = () => {
    const options = {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('masterapp-token')}`
        }
    };

    return axios.get('manager/account/groups', options).then(res => {
        localStorage.setItem('masterapp-groups', JSON.stringify(res.data));
    });
};

window.queue = new Queue({
    process(job) {
        const method = job.method || 'get';
        const signature = generateSignature(
            process.env.VUE_APP_PRIVATEKEY,
            process.env.VUE_APP_FINGERPRINT,
            method.toUpperCase(),
            job.url
        );

        const options = {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('masterapp-token')}`,
                'X-fingerprint': process.env.VUE_APP_FINGERPRINT,
                'X-signature': signature
            }
        };

        return logOperator().then(() =>
            axios({
                method,
                url: job.url,
                data: job.data,
                ...Object.assign({}, options, job.params)
            })
        );
    },

    syncInterval: 60000,
    syncToStorage: localStorage
});

logOperator().then(() => fetchGroups());

// force / as initial URL on cordova
Vue.nextTick(() => {
    window.app.$router.replace('/');
});
