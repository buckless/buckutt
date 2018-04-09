import Participants from './Participants.vue';
import ParticipantsList from './ParticipantsList.vue';
import ParticipantsStaff from './ParticipantsStaff.vue';

import ParticipantShow from './participant/ParticipantShow.vue';
import ParticipantShowDetails from './participant/ParticipantShowDetails.vue';
import ParticipantEditGroups from './participant/ParticipantEditGroups.vue';
import ParticipantEditRights from './participant/ParticipantEditRights.vue';

export default [
    {
        path: '/participants',
        component: Participants,
        children: [
            { path: '', component: ParticipantsList },
            { path: 'staff', component: ParticipantsStaff }
        ]
    },
    {
        path: '/participants/:participant',
        component: ParticipantShow,
        children: [
            { path: '', component: ParticipantShowDetails },
            { path: 'groups', component: ParticipantEditGroups },
            { path: 'rights', component: ParticipantEditRights }
        ]
    }
];
