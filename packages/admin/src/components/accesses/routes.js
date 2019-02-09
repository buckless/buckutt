import Accesses from './Accesses.vue';
import AccessesList from './AccessesList.vue';

export default [
    {
        path: '/accesses',
        component: Accesses,
        children: [{ path: '', component: AccessesList }]
    }
];
