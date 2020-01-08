import 'promise-polyfill';
import 'whatwg-fetch';

import Vue from 'vue';
import VueRouter from 'vue-router';
import Vuex from 'vuex';
import { sync } from 'vuex-router-sync';
import 'moment/locale/fr';

import store from './store/index';
import routes from './routes';

import App from './App.vue';
import Confirm from './components/Confirm.vue';

import Autocomplete from 'ui/src/components/Autocomplete/Autocomplete';
import Button from 'ui/src/components/Button/Button';
import Card from 'ui/src/components/Card/Card';
import Container from 'ui/src/components/Modal/Container';
import Checkbox from 'ui/src/components/Checkbox/Checkbox';
import DateTimeInput from 'ui/src/components/DateTimeInput/DateTimeInput';
import Dropzone from 'ui/src/components/Dropzone/Dropzone';
import DSwitch from 'ui/src/components/DetailedSwitch/DetailedSwitch';
import Icon from 'ui/src/components/Icon/Icon';
import Input from 'ui/src/components/Input/Input';
import ListItem from 'ui/src/components/ListItem/ListItem';
import Modal from 'ui/src/components/Modal/Modal';
import Notification from 'ui/src/components/Notification/Notification';
import Pagination from 'ui/src/components/Pagination/Pagination';
import ProTip from 'ui/src/components/ProTip/ProTip';
import SearchInput from 'ui/src/components/SearchInput/SearchInput';
import Select from 'ui/src/components/Select/Select';
import { default as Tabs, Tab } from 'ui/src/components/Tabs/Tabs';
import Table from 'ui/src/components/Table/Table';
import Toggle from 'ui/src/components/Toggle/Toggle';

moment.locale('fr');

Vue.use(VueRouter);
Vue.use(Vuex);

Vue.component('b-confirm', Confirm);

// UI
Vue.component('b-autocomplete', Autocomplete);
Vue.component('b-button', Button);
Vue.component('b-card', Card);
Vue.component('b-container', Container);
Vue.component('b-checkbox', Checkbox);
Vue.component('b-datetimeinput', DateTimeInput);
Vue.component('b-dropzone', Dropzone);
Vue.component('b-dswitch', DSwitch);
Vue.component('b-icon', Icon);
Vue.component('b-input', Input);
Vue.component('b-listitem', ListItem);
Vue.component('b-modal', Modal);
Vue.component('b-notification', Notification);
Vue.component('b-pagination', Pagination);
Vue.component('b-protip', ProTip);
Vue.component('b-searchinput', SearchInput);
Vue.component('b-select', Select);
Vue.component('b-tab', Tab);
Vue.component('b-table', Table);
Vue.component('b-tabs', Tabs);
Vue.component('b-toggle', Toggle);

const router = new VueRouter({ routes });

router.beforeEach(async (route, from, next) => {
    await store.dispatch('checkAndCreateNeededRouterData', route);

    const routePath = route.path.split('/');
    const path = routePath[1];

    if (path !== '' && !store.getters.logged) {
        // The administrator isn't logged, redirection to the login
        return next('/');
    }

    if (Object.keys(route.params).length > 0) {
        store.dispatch('loadFocusedElements', route.params);
    }

    store.commit('UPDATEFIRSTLOAD', true);
    next();
});

const Admin = Vue.extend({
    router,
    store,
    components: { App },
    render: h => h(App)
});

new Admin().$mount('#app');
sync(store, router);
