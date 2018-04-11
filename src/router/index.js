import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import GeneratePin from '@/components/GeneratePin';

const History = () => import(/* webpackChunkName: "dashboard" */ '@/components/History');
const Reload = () => import(/* webpackChunkName: "dashboard" */ '@/components/Reload');
const ReloadStatus = () => import(/* webpackChunkName: "dashboard" */ '@/components/ReloadStatus');
const AssignStatus = () => import(/* webpackChunkName: "dashboard" */ '@/components/AssignStatus');
const Account = () => import(/* webpackChunkName: "dashboard" */ '@/components/Account');
const Transfer = () => import(/* webpackChunkName: "dashboard" */ '@/components/Transfer');
const Logout = () => import(/* webpackChunkName: "dashboard" */ '@/components/Logout');

Vue.use(Router);

const routes = [
    {
        path: '/',
        component: Home
    },
    {
        path: '/history',
        component: History
    },
    {
        path: '/reload',
        component: Reload
    },
    {
        path: '/reload/success',
        component: ReloadStatus,
        props: {
            status: 'success'
        }
    },
    {
        path: '/reload/failed',
        component: ReloadStatus,
        props: {
            status: 'failed'
        }
    },
    {
        path: '/assign/success',
        component: AssignStatus,
        props: {
            status: 'success'
        }
    },
    {
        path: '/assign/failed',
        component: AssignStatus,
        props: {
            status: 'failed'
        }
    },
    {
        path: '/account',
        component: Account
    },
    {
        path: '/forgot-pin',
        component: GeneratePin
    },
    {
        path: '/transfer',
        component: Transfer
    },
    {
        path: '/logout',
        component: Logout
    }
];

const router = new Router({
    routes,
    mode: 'history'
});

router.beforeEach((route, from, next) => {
    const logged = !!router.app.$store.state.app.loggedUser;

    const unloggedUrls = ['/', '/forgot-pin', '/assign/success', '/assign/failed'];

    if (unloggedUrls.indexOf(route.path) === -1 && !logged) {
        next('/');
    } else if (route.path === '/' && logged) {
        next('/history');
    } else {
        next();
    }
});

export default router;
