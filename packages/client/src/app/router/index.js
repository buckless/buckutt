import Vue from 'vue';
import VueRouter from 'vue-router';

import store from '@/store';
import { reloadOnly, reloadNotOnly, routeChooser } from './chooser';

import Items from '@/views/Items';
import Reload from '@/views/Reload';
import Login from '@/views/Login';
import Assigner from '@/views/Assigner';
import AssignerSearch from '@/views/Assigner-Search';
import AssignerScan from '@/views/Assigner-Scan';
import Controller from '@/views/Controller';
import History from '@/views/History';
import Treasury from '@/views/Treasury';
import Developpers from '@/views/Developpers';
import Health from '@/views/Health';
import PriceChooser from '@/views/PriceChooser';

Vue.use(VueRouter);

const { getters } = store;

const routes = [
    {
        path: '/items',
        component: Items,
        beforeEnter: (_, __, next) => next(getters.isSellerMode || '/'),
        children: [
            {
                path: 'reload',
                component: Reload,
                beforeEnter: (_, __, next) => next(reloadNotOnly() || '/')
            },
            {
                path: 'chooser/:item',
                component: PriceChooser,
                beforeEnter: (_, __, next) => next(getters.isSellerMode || '/')
            }
        ]
    },
    {
        path: '/login',
        component: Login,
        beforeEnter: (_, __, next) => next(getters.loginState || '/')
    },
    {
        path: '/history',
        component: History,
        beforeEnter: (_, __, next) => next(getters.isCashMode || '/')
    },
    {
        path: '/treasury',
        component: Treasury,
        beforeEnter: (_, __, next) => next(getters.isCashMode || '/')
    },
    {
        path: '/developpers',
        component: Developpers
    },
    {
        path: '/controller',
        component: Controller,
        beforeEnter: (_, __, next) => next(getters.isControllerMode || '/')
    },
    {
        path: '/health',
        component: Health,
        beforeEnter: (_, __, next) => next(getters.isCashMode || '/')
    },
    {
        path: '/assigner',
        component: Assigner,
        beforeEnter: (_, __, next) => next(getters.isAssignerMode || '/'),
        children: [
            { path: '/', component: AssignerSearch },
            { path: 'search', component: AssignerSearch },
            { path: 'scan', component: AssignerScan }
        ]
    },
    {
        path: '/reload',
        component: Reload,
        beforeEnter: (_, __, next) => next(reloadOnly() || '/'),
        props: { reloadOnly: true }
    },
    {
        path: '/',
        beforeEnter: routeChooser
    }
];

const router = new VueRouter({
    routes
});

// if page is reloaded, go back to / to know what page to restore
store.subscribe(mutation => {
    if (mutation.type === 'RESTORE_MUTATION') {
        router.push('/');
    }
});

export default router;
