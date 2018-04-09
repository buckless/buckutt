import Periods from './Periods.vue';
import PeriodsCreate from './PeriodsCreate.vue';
import PeriodsList from './PeriodsList.vue';

import PeriodShow from './period/PeriodShow.vue';
import PeriodShowDetails from './period/PeriodShowDetails.vue';
import PeriodEditObject from './period/PeriodEditObject.vue';

export default [
    {
        path: '/periods',
        component: Periods,
        children: [
            { path: '', component: PeriodsList },
            { path: 'create', component: PeriodsCreate }
        ]
    },
    {
        path: '/periods/:period',
        component: PeriodShow,
        children: [
            { path: '', component: PeriodShowDetails },
            { path: 'edit', component: PeriodEditObject }
        ]
    }
];
