import Base from '../base/Base.vue';
import Show from '../base/Show.vue';
import Details from '../base/Details.vue';
import Protip from '../base/Protip.vue';

import Transactions from './Transactions.vue';
import Refund from './Refund.vue';
import Reload from './Reload.vue';
import Groups from '../users/Groups.vue';
import Add from '../users/AddGroups.vue';
import User from './User.vue';

import config from './config';

export default [
    {
        path: '/wallets',
        props: config,
        component: Base,
        children: [
            {
                path: '',
                props: config,
                component: Protip
            },
            {
                path: ':wallet',
                props: config,
                component: Show,
                children: [
                    { path: '', props: config, component: Details },
                    {
                        path: 'transactions',
                        component: Transactions,
                        children: [{ path: 'refund', component: Refund }, { path: 'reload', component: Reload }]
                    },
                    {
                        path: 'groups',
                        props: config,
                        component: Groups,
                        children: [{ path: 'add', props: config, component: Add }]
                    },
                    { path: 'user', component: User }
                ]
            }
        ]
    }
];
