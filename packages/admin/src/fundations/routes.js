import Fundations from './Fundations.vue';
import FundationsCreate from './FundationsCreate.vue';
import FundationsList from './FundationsList.vue';

import FundationShow from './fundation/FundationShow.vue';
import FundationShowDetails from './fundation/FundationShowDetails.vue';
import FundationEditObject from './fundation/FundationEditObject.vue';

export default [
    {
        path: '/fundations',
        component: Fundations,
        children: [
            { path: '', component: FundationsList },
            { path: 'create', component: FundationsCreate }
        ]
    },
    {
        path: '/fundations/:fundation',
        component: FundationShow,
        children: [
            { path: '', component: FundationShowDetails },
            { path: 'edit', component: FundationEditObject }
        ]
    }
];
