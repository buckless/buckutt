import Wallets from './Wallets.vue';
import WalletsList from './WalletsList.vue';

import WalletShow from './wallet/WalletShow.vue';
import WalletShowDetails from './wallet/WalletShowDetails.vue';
import WalletEditObject from './wallet/WalletEditObject.vue';
import WalletEditRefund from './wallet/WalletEditRefund.vue';
import WalletEditGroups from './wallet/WalletEditGroups.vue';
import WalletTransactions from './wallet/WalletTransactions.vue';

export default [
    {
        path: '/wallets',
        component: Wallets,
        children: [{ path: '', component: WalletsList }]
    },
    {
        path: '/wallets/:wallet',
        component: WalletShow,
        children: [
            { path: '', component: WalletShowDetails },
            { path: 'edit', component: WalletEditObject },
            { path: 'refund', component: WalletEditRefund },
            { path: 'groups', component: WalletEditGroups },
            { path: 'transactions', component: WalletTransactions }
        ]
    }
];
