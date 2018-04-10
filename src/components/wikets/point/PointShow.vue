<template>
    <div class="b-wikets b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="displayedTabs"
                :inCard="true"
                :goBack="true"
                :level="2">
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
            focusedPoint: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['event']),

        title() {
            return `Guichet ${this.focusedPoint.name}`;
        },

        displayedTabs() {
            const tabs = [{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }, { route: 'assign', name: 'Assigner des équipements' }];

            if (this.event.useGroups) {
                tabs.push({ route: 'preferences', name: 'Préférences' });
            }

            return tabs;
        }
    }
};
</script>
