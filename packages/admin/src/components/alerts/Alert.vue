<template>
    <div class="b-alert">
        <div class="b-alert-content">
            <b-navbar
                icon="add_alert"
                title="Alertes"
                :tabs="[{ title: 'Historique', route: '/alerts' }]"
            />

            <b-pagination :rows="displayedAlerts" v-slot="{ rows }">
                <b-table :rows="rows" />
            </b-pagination>

            <div class="b-alert-actions">
                <div class="b--flexspacer"></div>
                <b-button raised to="/alerts/create">Nouvelle alerte</b-button>
            </div>
        </div>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Navbar from '../base/Navbar.vue';
import sortOrder from '@/lib/sortOrder';
import { parseDate } from '@/lib/date';

export default {
    components: {
        'b-navbar': Navbar
    },

    computed: {
        ...mapGetters(['getApiObjects']),

        displayedAlerts() {
            return this.getApiObjects('alerts')
                .slice()
                .sort((a, b) => sortOrder(a.created_at, b.created_at, 'DESC'))
                .map(alert => ({
                    icon: 'notification_important',
                    title: alert.content,
                    subtitle: `Date: ${parseDate(alert.created_at)}`
                }));
        }
    }
};
</script>

<style scoped>
.b-alert {
    flex: 1;
    padding: 20px;

    & > .b-alert-content {
        max-width: 870px;
        margin: 0 auto;
    }
}

.b-alert-actions {
    display: flex;
    margin-top: 15px;
}
</style>
