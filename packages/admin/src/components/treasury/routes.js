import Base from './Base.vue';
import Reloads from './Reloads.vue';
import Purchases from './Purchases.vue';
import Refunds from './Refunds.vue';
import Withdrawals from './Withdrawals.vue';
import Protip from '../base/Protip.vue';
import Export from './Export.vue';

import config from './config';

export default [
    {
        path: '/treasury',
        component: Base,
        children: [
            { path: '', props: config, component: Protip },
            { path: 'export', props: { default: config }, components: { default: Protip, export: Export }},
            { path: 'reloads', component: Reloads },
            { path: 'reloads/export', components: { default: Reloads, export: Export }},
            { path: 'purchases', component: Purchases },
            { path: 'purchases/export', components: { default: Purchases, export: Export }},
            { path: 'refunds', component: Refunds },
            { path: 'refunds/export', components: { default: Refunds, export: Export }},
            { path: 'withdrawals', component: Withdrawals },
            { path: 'withdrawals/export', components: { default: Withdrawals, export: Export }}
        ]
    }
];
