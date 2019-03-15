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
            focusedWallet: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['event']),

        title() {
            return `Support ${this.focusedWallet.physical_id ||
                this.focusedWallet.logical_id ||
                'anonyme'}`;
        },

        tabs() {
            const tabs = [
                { route: '', name: 'Détails', exact: true },
                { route: 'edit', name: 'Édition' },
                { route: 'transactions', name: 'Transactions' },
                { route: 'refund', name: 'Remboursement' }
            ];

            if (this.event.useGroups && !this.focusedWallet.user) {
                tabs.push({ route: 'groups', name: 'Groupes' });
            }

            return tabs;
        }
    }
};
</script>
