import Base from '../base/Base.vue';
import Show from '../base/Show.vue';
import Details from '../base/Details.vue';
import Protip from '../base/Protip.vue';
import Options from './Options.vue';
import Assign from './Assign.vue';
import Add from './AddAssign.vue';

import config from './config';

export default [
    {
        path: '/devices',
        props: config,
        component: Base,
        children: [
            { path: '', props: config, component: Protip },
            {
                path: ':device',
                props: config,
                component: Show,
                children: [
                    { path: '', props: config, component: Details },
                    { path: 'options', component: Options },
                    {
                        path: 'assign',
                        props: config,
                        component: Assign,
                        children: [{ path: 'add', props: config, component: Add }]
                    }
                ]
            }
        ]
    }
];
