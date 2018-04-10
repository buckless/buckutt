import EventShow from './event/EventShow.vue';
import EventShowDetails from './event/EventShowDetails.vue';
import EventEditObject from './event/EventEditObject.vue';
import EventEditConfig from './event/EventEditConfig.vue';

export default [
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
