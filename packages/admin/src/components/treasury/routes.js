import Base from './Base.vue';
import Reloads from './Reloads.vue';
import Purchases from './Purchases.vue';
import Refunds from './Refunds.vue';
import Withdrawals from './Withdrawals.vue';
import Protip from '../base/Protip.vue';

import config from './config';

export default [
    {
        path: '/treasury',
        component: Base,
        children: [
            { path: '', props: config, component: Protip },
            { path: 'reloads', component: Reloads },
            { path: 'purchases', component: Purchases },
            { path: 'refunds', component: Refunds },
            { path: 'withdrawals', component: Withdrawals }
        ]
    }
];
