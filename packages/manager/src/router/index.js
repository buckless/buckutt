import Vue from 'vue';
import Router from 'vue-router';

import Faq from '../views/faq/Faq';
import Forgot from '../views/forgot/Forgot';
import Dashboard from '../views/dashboard/Dashboard';
import Home from '../views/home/Home';
import LinkTicket from '../views/link-ticket/LinkTicket';
import LockSupport from '../views/lock-support/LockSupport';
import Login from '../views/login/Login';
import RefundFailed from '../views/refund/RefundFailed';
import RefundSuccess from '../views/refund/RefundSuccess';
import Register from '../views/register/Register';
import RegisterCard from '../views/register-card/RegisterCard';
import RegisterTicket from '../views/register-ticket/RegisterTicket';
import RegisterSuccess from '../views/register-success/RegisterSuccess';
import ReloadFailed from '../views/reload/ReloadFailed';
import ReloadSuccess from '../views/reload/ReloadSuccess';
import Reset from '../views/forgot/Reset';
import Ticket from '../views/ticket/Ticket';
import User from '../views/user/User';
import Wallet from '../views/wallet/Wallet';

import { isUserLoggedIn, isUserAllowedToSeeRegisterStep } from './routeGuards';
import { saveRouteBeforeAuth } from '../storage';

Vue.use(Router);

const routes = [
    {
        path: '/',
        redirect: () => (isUserLoggedIn() ? '/dashboard' : '/login')
    },
    {
        path: '/dashboard',
        component: Dashboard,
        children: [
            { path: '', component: Home, meta: { auth: true } },
            {
                path: 'ticket',
                component: Ticket,
                meta: { auth: true },
                children: [{ path: 'link', component: LinkTicket, meta: { auth: true } }]
            },
            { path: 'user', component: User, meta: { auth: true } },
            {
                path: 'wallet',
                component: Wallet,
                meta: { auth: true },
                children: [{ path: 'lock', component: LockSupport, meta: { auth: true } }]
            },
            { path: 'faq', component: Faq, meta: { auth: true } }
        ]
    },
    {
        path: '/reload',
        component: Dashboard,
        children: [
            { path: 'failed', component: ReloadFailed, meta: { auth: true } },
            { path: 'success', component: ReloadSuccess, meta: { auth: true } }
        ]
    },
    {
        path: '/refund',
        component: Dashboard,
        children: [
            { path: 'failed', component: RefundFailed, meta: { auth: true } },
            { path: 'success', component: RefundSuccess, meta: { auth: true } }
        ]
    },
    { path: '/login', component: Login, meta: { guest: true } },
    { path: '/faq', component: Faq, meta: { guest: true }, props: { isDashboard: false } },
    { path: '/forgot', component: Forgot, meta: { guest: true } },
    { path: '/forgot/:key', component: Reset, meta: { guest: true } },
    { path: '/register', component: Register, meta: { guest: true } },
    {
        path: '/register/card',
        component: RegisterCard,
        meta: { guest: true, registerStep: 'card' }
    },
    {
        path: '/register/ticket',
        component: RegisterTicket,
        meta: { guest: true, registerStep: 'ticket' }
    },
    {
        path: '/register/success',
        component: RegisterSuccess,
        meta: { guest: true, registerStep: 'success' }
    }
];

export const router = new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
});

router.beforeEach((to, from, next) => {
    // guest mode check
    if (to.meta.guest && isUserLoggedIn()) {
        return next('/dashboard');
    }

    // auth mode check
    if (to.meta.auth && !isUserLoggedIn()) {
        saveRouteBeforeAuth(to.path);
        return next('/login');
    }

    // register step check
    if (to.meta.registerStep && !isUserAllowedToSeeRegisterStep(to.meta.registerStep)) {
        return next('/register');
    }

    next();
});
