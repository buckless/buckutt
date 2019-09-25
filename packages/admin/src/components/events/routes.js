import Base from './Base.vue';
import Show from './Show.vue';
import Details from './Details.vue';

import Bank from './event/Bank.vue';
import Nfc from './event/Nfc.vue';

import Create from '../base/Create.vue';
import Edit from '../base/Edit.vue';
import Protip from '../base/Protip.vue';

import {
    default as config,
    hooks,
    event,
    events,
    advanced,
    dates,
    periods,
    groups,
    fundations,
    reloads,
    refunds,
    eventsReload,
    costsReload,
    giftReloads,
    eventsRefund,
    costsRefund,
    meansOfPayment
} from './config.js';

export default [
    {
        path: '/events',
        component: Base,
        children: [
            { path: '', props: config, component: Protip },
            {
                path: 'reloads',
                props: reloads,
                component: Show,
                children: [
                    { path: '', props: eventsReload, component: Details },
                    { path: 'costs', props: costsReload, component: Details },
                    {
                        path: 'meansofpayment',
                        component: Bank,
                        props: meansOfPayment,
                        children: [
                            { path: 'create', props: meansOfPayment, component: Create },
                            { path: ':meanofpayment', props: meansOfPayment, component: Edit }
                        ]
                    },
                    {
                        path: 'giftreloads',
                        component: Bank,
                        props: giftReloads,
                        children: [
                            { path: 'create', props: giftReloads, component: Create },
                            { path: ':giftreload', props: giftReloads, component: Edit }
                        ]
                    }
                ]
            },
            {
                path: 'refunds',
                props: refunds,
                component: Show,
                children: [
                    { path: '', props: eventsRefund, component: Details },
                    { path: 'costs', props: costsRefund, component: Details }
                ]
            },
            {
                path: 'advanced',
                component: Show,
                props: advanced,
                children: [
                    {
                        path: 'webservices',
                        component: Bank,
                        props: hooks,
                        children: [
                            { path: 'create', props: hooks, component: Create },
                            { path: ':webservice', props: hooks, component: Edit }
                        ]
                    }
                ]
            },
            {
                path: 'event',
                component: Show,
                props: event,
                children: [
                    { path: '', props: events, component: Details },
                    { path: 'dates', props: dates, component: Details },
                    {
                        path: 'periods',
                        props: periods,
                        component: Bank,
                        children: [
                            { path: 'create', props: periods, component: Create },
                            { path: ':period', props: periods, component: Edit }
                        ]
                    },
                    {
                        path: 'groups',
                        props: groups,
                        component: Bank,
                        children: [
                            { path: 'create', props: groups, component: Create },
                            { path: ':group', props: groups, component: Edit }
                        ]
                    },
                    {
                        path: 'fundations',
                        props: fundations,
                        component: Bank,
                        children: [
                            { path: 'create', props: fundations, component: Create },
                            { path: ':fundation', props: fundations, component: Edit }
                        ]
                    },
                    { path: 'nfc', component: Nfc },
                    { path: 'nfc/:article', component: Nfc }
                ]
            }
        ]
    }
];
