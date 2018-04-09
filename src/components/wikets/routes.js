import Wikets from './Wikets.vue';
import WiketPanel from './WiketPanel.vue';
import WiketAssign from './assignments/WiketAssign.vue';
import WiketAssignList from './assignments/WiketAssignList.vue';
import WiketAssignPreferences from './assignments/WiketAssignPreferences.vue';

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
        path: '/wikets/:wiket/assign',
        component: WiketAssign,
        children: [
            { path: '', component: WiketAssignList },
            { path: 'preferences', component: WiketAssignPreferences }
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
