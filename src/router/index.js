import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import GeneratePin from '@/components/GeneratePin';

const History = () => import(/* webpackChunkName: "dashboard" */ '@/components/History');
const Reload = () => import(/* webpackChunkName: "dashboard" */ '@/components/Reload');
const ReloadStatus = () => import(/* webpackChunkName: "dashboard" */ '@/components/ReloadStatus');
const ChangePin = () => import(/* webpackChunkName: "dashboard" */ '@/components/ChangePin');
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
        path: '/pin',
        component: ChangePin
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

    if (route.path !== '/' && route.path !== '/forgot-pin' && !logged) {
        next('/');
    } else if (route.path === '/' && logged) {
        next('/history');
    } else {
        next();
    }
});

export default router;
