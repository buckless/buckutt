import Points from './Points.vue';
import PointsCreate from './PointsCreate.vue';
import PointsList from './PointsList.vue';

import PointShow from './point/PointShow.vue';
import PointShowDetails from './point/PointShowDetails.vue';
import PointEditObject from './point/PointEditObject.vue';

export default [
    {
        path: '/points',
        component: Points,
        children: [{ path: '', component: PointsList }, { path: 'create', component: PointsCreate }]
    },
    {
        path: '/points/:point',
        component: PointShow,
        children: [
            { path: '', component: PointShowDetails },
            { path: 'edit', component: PointEditObject }
        ]
    }
];
