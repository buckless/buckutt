import Vue from 'vue';
import Router from 'vue-router';
import { sync } from 'vuex-router-sync';
import store from './store';

import Login from '@/views/Login';
import Forgot from '@/views/Forgot';
import Register from '@/views/Register';
import RegisterChooser from '@/views/Register-Chooser';
import RegisterForm from '@/views/Register-Form';
import RegisterTicket from '@/views/Register-Ticket';
import RegisterStatus from '@/views/RegisterStatus';

const Dashboard = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard');
const DashboardMenu = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Menu');
const DashboardReload = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Reload');
const DashboardHistory = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-History');
const DashboardTransfer = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Transfer');
const DashboardAccount = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Account');
const DashboardBlock = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Block');
const DashboardPIN = () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-PIN');
const DashboardRefund = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Refund');
const DashboardSupport = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Support');
const DashboardTicket = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-Ticket');
const DashboardInvoice = () =>
    import(/* webpackChunkName: "invoice" */ '@/views/Dashboard-Invoice');
const DashboardReloadStatus = () =>
    import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard-ReloadStatus');

Vue.use(Router);

const routes = [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: Login, meta: { guest: true } },
    { path: '/forgot', component: Forgot, meta: { guest: true } },
    {
        path: '/register',
        component: Register,
        meta: { guest: true },
        children: [
            { path: '', component: RegisterChooser },
            { path: 'form', component: RegisterForm },
            { path: 'ticket', component: RegisterTicket }
        ]
    },
    { path: '/reload/:status', component: DashboardReloadStatus },
    { path: '/register/:status', component: RegisterStatus },
    {
        path: '/dashboard',
        component: Dashboard,
        meta: { auth: true },
        children: [
            { path: '', redirect: '/dashboard/reload' },
            { path: 'reload', component: DashboardReload },
            { path: 'menu', component: DashboardMenu },
            { path: 'history', component: DashboardHistory },
            { path: 'transfer', component: DashboardTransfer },
            { path: 'account', component: DashboardAccount },
            { path: 'block', component: DashboardBlock },
            { path: 'pin', component: DashboardPIN },
            { path: 'refund', component: DashboardRefund },
            { path: 'support', component: DashboardSupport },
            { path: 'ticket', component: DashboardTicket },
            { path: 'invoice', component: DashboardInvoice }
        ]
    }
];

const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, from, next) => {
    const isLoggedIn = store.state.user.user;

    if (to.matched.some(record => record.meta.auth) && !isLoggedIn) {
        const wantedUrl = to.matched[to.matched.length - 1].path;

        sessionStorage.setItem('buckless/manager/redirect-after-login', wantedUrl);

        return next('/login');
    }

    if (to.matched.some(record => record.meta.guest) && isLoggedIn) {
        next('/');
    }

    next();
});

sync(store, router);

export default router;
