import 'promise-polyfill';
import 'whatwg-fetch';

import DateTimePicker from '@buckless/datetime-picker';
import Vue            from 'vue';
import VueRouter      from 'vue-router';
import Vuex           from 'vuex';
import VueMdl         from 'vue-mdl';
import { sync }       from 'vuex-router-sync';

import '@buckless/datetime-picker/dist/datetime-picker.min.css';
import 'material-design-lite/material.min.js';
import 'material-design-lite/material.min.css';
import './assets/font.css';

import store  from './store/index';
import routes from './routes';

import App            from './App.vue';
import Confirm        from './components/Confirm.vue';
import Navbar         from './components/Navbar.vue';
import PaginatedTable from './components/PaginatedTable.vue';

import './lib/textfield.js';
import { isEventConfigured } from './lib/isEventConfigured';

moment.locale('fr');

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueMdl);

Vue.component('b-confirm', Confirm);
Vue.component('b-datetime-picker', DateTimePicker);
Vue.component('b-navbar', Navbar);
Vue.component('b-table', PaginatedTable);

const withoutEventRoutes = ['', 'logout', 'events', 'treasury'];

const router = new VueRouter({ routes });

router.beforeEach((route, from, next) => {
    store.dispatch('checkAndCreateNeededRouterData')
        .then(() => {
            const routePath = route.path.split('/');
            const path      = routePath[1];
            if ((path !== '' && !store.getters.logged)
                || (withoutEventRoutes.indexOf(path) === -1 && !store.state.app.currentEvent)) {
                store.dispatch('clearModObject');
                next('/');
            } else if (!isEventConfigured(store.state.app.currentEvent)
                && path !== 'events'
                && routePath[2] !== 'config') {
                next(`/events/config/${store.state.app.currentEvent.id}`);
            } else if (route.params.id) {
                store.dispatch('expandObject', {
                    route: path,
                    value: { id: route.params.id }
                })
                .then(() => next())
                .catch(() => next(from.path));
            } else {
                store.dispatch('clearModObject');
                next();
            }
        })
        .catch(() => {
            store.dispatch('showClientError', {
                message: 'Impossible de récupérer l\'événement, veuillez actualiser la page'
            });
        });
});

const Admin = Vue.extend({
    router,
    store,
    components: { App },
    template  : '<App></App>',
    methods   : {
        goBack() {
            router.push(`/${store.state.route.path.split('/')[1]}`);
        }
    }
});

const vueApp = new Admin().$mount('#app');
sync(store, router);

store.subscribe((mutation) => {
    switch (mutation.type) {
        case 'UPDATEAPIERROR':
            vueApp.$root.$emit('snackfilter', {
                message: `[API] ${mutation.payload.statusText}`
            });
            break;
        case 'UPDATECLIENTERROR':
            vueApp.$root.$emit('snackfilter', {
                message: `[CLIENT] ${mutation.payload.message}`
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
