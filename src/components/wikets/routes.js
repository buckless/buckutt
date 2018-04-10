import Wikets from './Wikets.vue';
import WiketPanel from './WiketPanel.vue';

import PointShow from './point/PointShow.vue';
import PointShowDetails from './point/PointShowDetails.vue';
import PointEditObject from './point/PointEditObject.vue';
import PointAssign from './point/PointAssign.vue';
import PointPreferences from './point/PointPreferences.vue';

import ClientViewer from './wiket/ClientViewer';
import ClientAddArticle from './wiket/ClientViewer-AddArticle';
import ClientPanel from './wiket/ClientViewer-Panel';
import WiketAddCategory from './wiket/WiketAddCategory';

import WiketShow from './wiket/WiketShow.vue';

export default [
    {
        path: '/wikets',
        component: Wikets,
        children: [
            {
                path: 'add',
                component: WiketPanel
            }
        ]
    },
    {
        path: '/points/:point',
        component: PointShow,
        children: [
            { path: '', component: PointShowDetails },
            { path: 'edit', component: PointEditObject },
            { path: 'assign', component: PointAssign },
            { path: 'preferences', component: PointPreferences }
        ]
    },
    {
        path: '/wikets/:wiket',
        component: WiketShow,
        children: [
            {
                path: 'category/add',
                component: WiketAddCategory
            },
            {
                path: 'category/:category',
                component: ClientViewer,
                children: [
                    {
                        path: 'article/add',
                        component: ClientAddArticle
                    },
                    {
                        path: 'article/:article',
                        component: ClientPanel
                    },
                    {
                        path: 'promotion/:promotion',
                        component: ClientPanel
                    }
                ]
            }
        ]
    }
];
