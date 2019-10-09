import Base from '../base/Base.vue';
import Show from '../base/Show.vue';
import Details from '../base/Details.vue';
import Create from '../base/Create.vue';
import Protip from '../base/Protip.vue';

import Groups from './Groups.vue';
import Add from './AddGroups.vue';
import Rights from './Rights.vue';
import AddRights from './AddRights.vue';
import Transactions from './Transactions.vue';

import config from './config';
import addCreate from '../../lib/addCreate';

export default [
    {
        path: '/users',
        props: config,
        component: Base,
        children: [
            {
                path: '',
                props: config,
                component: Protip,
                children: [
                    {
                        path: 'create',
                        props: { default: config, create: config },
                        components: { create: Create }
                    }
                ]
            },
            {
                path: ':user',
                props: config,
                component: Show,
                children: addCreate(Create, [
                    { path: '', props: config, component: Details },
                    {
                        path: 'groups',
                        props: config,
                        component: Groups,
                        children: [{ path: 'add', props: config, component: Add }]
                    },
                    {
                        path: 'rights',
                        props: config,
                        component: Rights,
                        children: [{ path: 'add', props: config, component: AddRights }]
                    },
                    { path: 'transactions', component: Transactions }
                ])
            }
        ]
    }
];
