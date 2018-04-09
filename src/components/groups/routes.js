import Groups from './Groups.vue';
import GroupsCreate from './GroupsCreate.vue';
import GroupsList from './GroupsList.vue';

import GroupShow from './group/GroupShow.vue';
import GroupShowDetails from './group/GroupShowDetails.vue';
import GroupEditObject from './group/GroupEditObject.vue';

export default [
    {
        path: '/groups',
        component: Groups,
        children: [{ path: '', component: GroupsList }, { path: 'create', component: GroupsCreate }]
    },
    {
        path: '/groups/:group',
        component: GroupShow,
        children: [
            { path: '', component: GroupShowDetails },
            { path: 'edit', component: GroupEditObject }
        ]
    }
];
