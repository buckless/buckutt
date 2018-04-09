import Devices from './Devices.vue';
import DevicesCreate from './DevicesCreate.vue';
import DevicesList from './DevicesList.vue';

import DeviceShow from './device/DeviceShow.vue';
import DeviceShowDetails from './device/DeviceShowDetails.vue';
import DeviceEditObject from './device/DeviceEditObject.vue';
import DeviceEditConfig from './device/DeviceEditConfig.vue';
import DeviceEditSsl from './device/DeviceEditSsl.vue';

export default [
    {
        path: '/devices',
        component: Devices,
        children: [
            { path: '', component: DevicesList },
            { path: 'create', component: DevicesCreate }
        ]
    },
    {
        path: '/devices/:device',
        component: DeviceShow,
        children: [
            { path: '', component: DeviceShowDetails },
            { path: 'edit', component: DeviceEditObject },
            { path: 'config', component: DeviceEditConfig },
            { path: 'ssl', component: DeviceEditSsl }
        ]
    }
];
