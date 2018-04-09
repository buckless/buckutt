<template>
    <div class="b-wikets b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="displayedTabs"
                :inCard="true"
                :goBack="true"
                :level="3">
            </b-navbar>
            <router-view></router-view>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            currentEvent: state => state.app.currentEvent,
            focusedPoint: state => state.app.focusedElements[0]
        }),

        title() {
            return `Guichet ${this.focusedPoint.name}`;
        },

        displayedTabs() {
            const tabs = [{ route: '', name: 'Assigner des équipements', exact: true }];

            if (this.currentEvent.useGroups) {
                tabs.push({ route: 'preferences', name: 'Préférences' });
            }

            return tabs;
        }
    }
};
</script>
