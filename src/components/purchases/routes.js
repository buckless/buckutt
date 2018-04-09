import Purchases from './Purchases.vue';
import PurchasesExport from './PurchasesExport.vue';
import PurchasesShow from './PurchasesShow.vue';

export default [
    {
        path: '/purchases',
        component: Purchases,
        children: [
            { path: '', component: PurchasesShow },
            { path: 'export', component: PurchasesExport }
        ]
    }
];
