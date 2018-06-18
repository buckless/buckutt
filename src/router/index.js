import Vue from 'vue';
import Router from 'vue-router';

import Home from '@/components/Home';
import HomeLogin from '@/components/Home-Login';
import HomeRegister from '@/components/Home-Register';
import HomeRegisterAccount from '@/components/Home-RegisterAccount';
import HomeRegisterTicket from '@/components/Home-RegisterTicket';
import GeneratePin from '@/components/GeneratePin';

import History from '@/components/History';
import Reload from '@/components/Reload';
import ReloadStatus from '@/components/ReloadStatus';
import AssignStatus from '@/components/AssignStatus';
import Account from '@/components/Account';
import Transfer from '@/components/Transfer';
import Logout from '@/components/Logout';

Vue.use(Router);

const routes = [
    {
        path: '/',
        component: Home,
        children: [
            { path: '', redirect: 'login' },
            { path: 'login', component: HomeLogin },
            { path: 'register', component: HomeRegister },
            { path: 'register-account', component: HomeRegisterAccount },
            { path: 'register-ticket', component: HomeRegisterTicket }
        ]
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
        path: '/reload/waiting',
        component: ReloadStatus,
        props: {
            status: 'waiting'
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

    const unloggedUrls = [
        '/',
        '/login',
        '/register',
        '/register-account',
        '/register-ticket',
        '/forgot-pin',
        '/assign/success',
        '/assign/failed'
    ];

    if (unloggedUrls.indexOf(route.path) === -1 && !logged) {
        next('/');
    } else if (unloggedUrls.indexOf(route.path) > -1 && logged) {
        next('/history');
    } else {
        next();
    }
});

export default router;
