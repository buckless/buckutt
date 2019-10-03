<template>
    <b-container dropShadow @close="back">
        <b-modal title="Remboursement" @close="back" class="b-modal-create">
            <form @submit.prevent="create" class="b-create">
                <b-input
                    v-model="refund.amount"
                    label="Montant à rembourser (centimes)"
                    class="b-create-field"
                ></b-input>
                <b-input v-model="refund.trace" label="Raison" class="b-create-field"></b-input>
                <b-autocomplete
                    v-model="refund.type"
                    label="Moyen de paiement"
                    class="b-create-field"
                    :suggestions="typesOptions"
                ></b-autocomplete>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="create">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    data: () => ({
        refund: {
            amount: null,
            trace: null,
            type: null
        },
        typesOptions: [
            { label: 'Chèque', id: 'check' },
            { label: 'Espèces', id: 'cash' },
            { label: 'Annulation CB', id: 'card' },
            { label: 'Virement', id: 'wire' }
        ]
    }),

    methods: {
        ...mapActions(['refundWallet', 'notify']),

        async create() {
            try {
                await this.refundWallet({ wallet: this.focusedWallet, refund: this.refund });
                this.notify("Le remboursement a bien été effectué");
                this.back();
            } catch {
                this.notify("Le remboursement n'a pas pu être effectué");
            }
        },

        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedWallet() {
            return this.focusedElements[0];
        }
    }
};
</script>

<style scoped>
.b-modal-create {
    overflow: visible !important;
}

.b-create {
    & > .b-create-field {
        margin-top: 15px;
        display: block;
    }
}
</style>
