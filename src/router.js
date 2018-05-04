import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Initialize from '@/views/Initialize'
import Anon from '@/views/Anon'
import Options from '@/views/Options'

Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            component: Home
        },
        {
            path: '/initialize',
            component: Initialize
        },
        {
            path: '/anon',
            component: Anon
        },
        {
            path: '/options',
            component: Options
        }
    ]
})
