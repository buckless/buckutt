import 'promise-polyfill';
import 'whatwg-fetch';

import DateTimePicker from '@buckless/datetime-picker';
import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import VueMdl from 'vue-mdl';
import { sync } from 'vuex-router-sync';
import 'moment/locale/fr';

import '@buckless/datetime-picker/dist/datetime-picker.min.css';
import 'material-design-lite/material.min.js';
import 'material-design-lite/material.min.css';
import 'c3/c3.min.css';
import './assets/font.css';

import store from './store/index';
import routes from './routes';

import App from './App.vue';
import Confirm from './components/Confirm.vue';
import DetailedSwitch from './components/DetailedSwitch.vue';
import InputSelect from './components/InputSelect.vue';
import List from './components/List.vue';
import Navbar from './components/Navbar.vue';
import PaginatedTable from './components/PaginatedTable.vue';

import './lib/textfield.js';

moment.locale('fr');

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueMdl);

Vue.component('b-confirm', Confirm);
Vue.component('b-detailedswitch', DetailedSwitch);
Vue.component('b-datetime-picker', DateTimePicker);
Vue.component('b-inputselect', InputSelect);
Vue.component('b-list', List);
Vue.component('b-navbar', Navbar);
Vue.component('b-table', PaginatedTable);

const withoutEventRoutes = ['', 'logout', 'events', 'treasury', 'account'];

const router = new VueRouter({ routes });

router.beforeEach((route, from, next) => {
    store
        .dispatch('checkAndCreateNeededRouterData')
        .then(() => {
            const routePath = route.path.split('/');
            const path = routePath[1];

            if (
                (path !== '' && !store.getters.logged) ||
                (withoutEventRoutes.indexOf(path) === -1 && !store.state.app.currentEvent)
            ) {
                // The administrator isn't logged, redirection to the login
                store.dispatch('clearFocusedElements');
                next('/');
            } else if (Object.keys(route.params).length > 0) {
                store
                    .dispatch('loadFocusedElements', route.params)
                    .then(() => next())
                    .catch(() => next(from.path));
            } else {
                // Simple page change
                store.dispatch('clearFocusedElements');
                next();
            }
        })
        .catch(err => {
            store.dispatch('notifyError', {
                message: "Impossible de récupérer l'événement, veuillez actualiser la page",
                full: err
            });
        });
});

const Admin = Vue.extend({
    router,
    store,
    components: { App },
    template: '<App></App>',
    methods: {
        goBack() {
            router.push(`/${store.state.route.path.split('/')[1]}`);
        }
    }
});

const vueApp = new Admin().$mount('#app');
sync(store, router);

store.subscribe(mutation => {
    switch (mutation.type) {
        case 'UPDATEERROR':
            if (mutation.payload.full) {
                console.error(mutation.payload.full);
            }

            vueApp.$root.$emit('snackfilter', {
                message: `${mutation.payload.message}`
            });

            break;
        case 'UPDATENOTIFY':
            vueApp.$root.$emit('snackfilter', {
                message: mutation.payload.message
            });

            break;
        default:
            break;
    }
});
