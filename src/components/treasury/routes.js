import Treasury from './Treasury.vue';
import TreasuryExport from './TreasuryExport.vue';
import TreasuryShow from './TreasuryShow.vue';

export default [
    {
        path: '/treasury',
        component: Treasury,
        children: [
            { path: '', component: TreasuryShow },
            { path: 'export', component: TreasuryExport }
        ]
    }
];
