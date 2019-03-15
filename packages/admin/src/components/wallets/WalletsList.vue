<template>
    <div>
        <h5>Liste des supports</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield
                floating-label="Id physique du support"
                v-model="walletId"
                @input="search(walletId)"
            ></mdl-textfield>
            <i class="material-icons" id="usertip">info</i>
            <mdl-tooltip target="usertip"
                >En dessous de 3 caractères, seule la première page est affichée.</mdl-tooltip
            >
        </div>

        <b-table
            :headers="[
                { title: 'Id physique', field: 'physical_id' },
                { title: 'Id logique', field: 'logical_id' },
                { title: 'Utilisateur', field: 'user', class: 'b--capitalized' },
                { title: 'Ticket', field: 'ticket' }
            ]"
            :data="displayedWallets"
            :sort="{ field: 'firstname', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier', raised: true, colored: true },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="wallets"
            :paging="10"
            @edit="editWallet"
            @remove="removeObject"
            @pagingChanged="pagingChanged"
        >
        </b-table>
    </div>
</template>

<script>
import debounce from 'lodash.debounce';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            walletId: '',
            minResults: 10
        };
    },

    methods: {
        ...mapActions(['searchWallets', 'clearObject', 'removeObject']),

        editWallet(wallet) {
            this.$router.push(`/wallets/${wallet.id}/edit`);
        },

        pagingChanged(paging) {
            this.minResults = paging;
            this.searchWallets({ wallet: this.userName, min: this.minResults });
        },

        search(wallet) {
            this.searchWallets({ wallet, min: this.minResults });
        }
    },

    computed: {
        ...mapState({
            wallets: state => state.objects.wallets
        }),

        displayedWallets() {
            return this.wallets.map(wallet => ({
                ...wallet,
                physical_id: wallet.physical_id || 'Aucun',
                logical_id: wallet.logical_id || 'Aucun',
                user: wallet.user ? `${wallet.user.firstname} ${wallet.user.lastname}` : 'Aucun',
                ticket: wallet.ticket ? wallet.ticket.physical_id : 'Aucun'
            }));
        }
    },

    mounted() {
        this.search('');
        const search = this.search;
        this.search = debounce(name => search(name), 500);
    },

    destroyed() {
        this.clearObject('wallets');
    }
};
</script>
