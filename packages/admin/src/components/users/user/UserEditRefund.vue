<template>
    <div>
        <h5>Remboursement</h5>

        <form @submit.prevent="doRefund(focusedUser, refund)">
            <mdl-textfield
                floating-label="Montant (centimes)"
                v-model="refund.amount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield>
            <mdl-textfield
                floating-label="Raison"
                v-model="refund.trace"
                required="required"
                error="Le raison doit contenir au moins un caractère"
            ></mdl-textfield>
            <mdl-select
                label="Type de remboursement"
                id="type-select"
                v-model="refund.type"
                :options="typeOptions"
            ></mdl-select
            ><br />

            <mdl-button colored raised :disabled="!refund.type">Rembourser</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

const refundPattern = {
    amount: null,
    trace: null,
    type: null
};

export default {
    data() {
        return {
            refund: Object.assign({}, refundPattern),
            typeOptions: [
                { name: 'Chèque', value: 'check' },
                { name: 'Espèces', value: 'cash' },
                { name: 'Annulation CB', value: 'card' },
                { name: 'Virement', value: 'wire' }
            ]
        };
    },

    methods: {
        ...mapActions(['refundUser', 'notify', 'notifyError']),

        doRefund(user, refund) {
            this.refundUser({ user, refund })
                .then(() => this.notify({ message: 'Le remboursement a bien été effectué' }))
                .catch(err => {
                    let message = 'Erreur inconnue';
                    if (err.message === "The user doesn't have enough credit") {
                        message = "Le solde de l'utilisateur est inférieur au montant à rembourser";
                    }

                    this.notifyError({ message, full: err });
                });

            this.refund = Object.assign({}, refundPattern);
        }
    },

    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0]
        })
    }
};
</script>
