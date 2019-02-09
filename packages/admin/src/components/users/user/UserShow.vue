<template>
    <div class="b-users b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar
                :title="title"
                :tabs="[{ route: '', name: 'Détails', exact: true }, { route: 'edit', name: 'Édition' }, { route: 'transactions', name: 'Transactions' }, { route: 'refund', name: 'Remboursement' }, { route: 'rights', name: 'Droits' }, { route: 'groups', name: 'Groupes' } , { route: 'mol', name: 'Identifiants' }]"
                :inCard="true"
                :goBack="true"
                :level="2">
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
            focusedUser: state => state.app.focusedElements[0]
        }),

        title() {
            return `Utilisateur ${this.focusedUser.firstname} ${this.focusedUser.lastname}`;
        }
    }
};
</script>
