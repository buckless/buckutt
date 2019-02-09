import Alerts from './Alerts.vue';
import AlertsCreate from './AlertsCreate.vue';
import AlertsList from './AlertsList.vue';

export default [
    {
        path: '/alerts',
        component: Alerts,
        children: [{ path: '', component: AlertsList }, { path: 'create', component: AlertsCreate }]
    }
];
