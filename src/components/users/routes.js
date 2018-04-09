import Users from './Users.vue';
import UsersCreate from './UsersCreate.vue';
import UsersList from './UsersList.vue';

import UserShow from './user/UserShow.vue';
import UserShowDetails from './user/UserShowDetails.vue';
import UserEditObject from './user/UserEditObject.vue';
import UserEditRefund from './user/UserEditRefund.vue';
import UserEditMol from './user/UserEditMol.vue';
import UserTransactions from './user/UserTransactions.vue';

export default [
    {
        path: '/users',
        component: Users,
        children: [{ path: '', component: UsersList }, { path: 'create', component: UsersCreate }]
    },
    {
        path: '/users/:user',
        component: UserShow,
        children: [
            { path: '', component: UserShowDetails },
            { path: 'edit', component: UserEditObject },
            { path: 'refund', component: UserEditRefund },
            { path: 'mol', component: UserEditMol },
            { path: 'transactions', component: UserTransactions }
        ]
    }
];
