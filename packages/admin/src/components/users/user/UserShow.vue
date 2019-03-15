<template>
    <div class="b-users b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar :title="title" :tabs="tabs" :inCard="true" :goBack="true" :level="2">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['event']),

        title() {
            return `Utilisateur ${this.focusedUser.firstname} ${this.focusedUser.lastname}`;
        },

        tabs() {
            const tabs = [
                { route: '', name: 'Détails', exact: true },
                { route: 'edit', name: 'Édition' },
                { route: 'rights', name: 'Droits' }
            ];

            if (this.event.useGroups) {
                tabs.push({ route: 'groups', name: 'Groupes' });
            }

            return tabs;
        }
    }
};
</script>
