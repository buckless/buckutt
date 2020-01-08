<template>
    <b-container dropShadow @close="back">
        <b-modal title="Créditer le support" @close="back" class="b-modal-create">
            <form @submit.prevent="create" class="b-create">
                <b-input
                    v-model="reload.credit"
                    label="Montant à créditer (centimes)"
                    class="b-create-field"
                ></b-input>
                <b-input v-model="reload.trace" label="Raison" class="b-create-field"></b-input>
                <b-autocomplete
                    v-model="reload.type"
                    label="Moyen de paiement"
                    class="b-create-field"
                    :suggestions="meansOfPaymentOptions"
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
        reload: {
            credit: null,
            trace: null,
            type: null
        }
    }),

    methods: {
        ...mapActions(['reloadWallet', 'notify']),

        async create() {
            try {
                await this.reloadWallet({ wallet: this.focusedWallet, reload: this.reload });
                this.notify('Le support a bien été crédité');
                this.back();
            } catch {
                this.notify("Le support n'a pas pu être crédité");
            }
        },

        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['focusedElements', 'meansOfPaymentOptions']),

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
