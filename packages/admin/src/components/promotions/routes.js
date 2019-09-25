import Base from '../base/Base.vue';
import Show from '../base/Show.vue';
import Details from '../base/Details.vue';
import Create from '../base/Create.vue';
import Protip from '../base/Protip.vue';
import Content from './Content.vue';

import config from './config';
import addCreate from '../../lib/addCreate';

export default [
    {
        path: '/promotions',
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
                path: ':promotion',
                props: config,
                component: Show,
                children: addCreate(Create, [
                    { path: '', props: config, component: Details },
                    { path: 'content', props: config, component: Content }
                ])
            }
        ]
    }
];
