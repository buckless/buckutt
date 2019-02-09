import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/views/Home';
import Options from '@/views/Options';
import CardRead from '@/views/CardRead';
import Unlock from '@/views/Unlock';

Vue.use(Router);

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Home
        },
        {
            path: '/options',
            component: Options
        },
        {
            path: '/cardRead',
            component: CardRead
        },
        {
            path: '/unlock',
            component: Unlock
        }
    ]
});
