import GiftReloads from './GiftReloads.vue';
import GiftReloadsCreate from './GiftReloadsCreate.vue';
import GiftReloadsList from './GiftReloadsList.vue';

import GiftReloadShow from './giftreload/GiftReloadShow.vue';
import GiftReloadShowDetails from './giftreload/GiftReloadShowDetails.vue';
import GiftReloadEditObject from './giftreload/GiftReloadEditObject.vue';

export default [
    {
        path: '/giftreloads',
        component: GiftReloads,
        children: [
            { path: '', component: GiftReloadsList },
            { path: 'create', component: GiftReloadsCreate }
        ]
    },
    {
        path: '/giftreloads/:giftreload',
        component: GiftReloadShow,
        children: [
            { path: '', component: GiftReloadShowDetails },
            { path: 'edit', component: GiftReloadEditObject }
        ]
    }
];
