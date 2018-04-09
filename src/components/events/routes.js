import Events from './Events.vue';
import EventsCreate from './EventsCreate.vue';
import EventsList from './EventsList.vue';

import EventShow from './event/EventShow.vue';
import EventShowDetails from './event/EventShowDetails.vue';
import EventEditObject from './event/EventEditObject.vue';
import EventEditConfig from './event/EventEditConfig.vue';

export default [
    {
        path: '/events',
        component: Events,
        children: [{ path: '', component: EventsList }, { path: 'create', component: EventsCreate }]
    },
    {
        path: '/events/:event',
        component: EventShow,
        children: [
            { path: '', component: EventShowDetails },
            { path: 'edit', component: EventEditObject },
            { path: 'config', component: EventEditConfig }
        ]
    }
];
