import Webservices from './Webservices.vue';
import WebservicesCreate from './WebservicesCreate.vue';
import WebservicesList from './WebservicesList.vue';

import WebserviceShow from './webservice/WebserviceShow.vue';
import WebserviceShowDetails from './webservice/WebserviceShowDetails.vue';
import WebserviceEditObject from './webservice/WebserviceEditObject.vue';

export default [
    {
        path: '/webservices',
        component: Webservices,
        children: [
            { path: '', component: WebservicesList },
            { path: 'create', component: WebservicesCreate }
        ]
    },
    {
        path: '/webservices/:webservice',
        component: WebserviceShow,
        children: [
            { path: '', component: WebserviceShowDetails },
            { path: 'edit', component: WebserviceEditObject }
        ]
    }
];
