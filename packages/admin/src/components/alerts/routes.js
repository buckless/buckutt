import Alert from './Alert.vue';
import Create from '../base/Create.vue';

import config from './config';

export default [
    {
        path: '/alerts',
        component: Alert,
        children: [{ path: 'create', props: config, component: Create }]
    }
];
