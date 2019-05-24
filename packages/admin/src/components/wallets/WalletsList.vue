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
                { title: 'Numéro de carte', field: 'support_id', object: true },
                { title: 'Crédit', field: 'credit', type: 'price' }
            ]"
            :data="displayedWallets"
            :sort="{ field: 'support_id', order: 'ASC' }"
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
            return this.wallets
                .filter(wallet => wallet.physical_id || wallet.logical_id)
                .map(wallet => ({
                    ...wallet,
                    support_id: wallet.physical_id || wallet.logical_id
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
