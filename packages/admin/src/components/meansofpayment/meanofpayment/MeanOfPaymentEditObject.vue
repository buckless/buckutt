<template>
    <div>
        <h5>Modifier le moyen de paiement</h5>
        <form @submit.prevent="updateMeanOfPayment(focusedMeanOfPayment)">
            <mdl-textfield
                floating-label="Nom"
                @input="updateDeepestFocusedElement({ field: 'name', value: $event })"
                :value="focusedMeanOfPayment.name"
                required="required"
                error="Le nom doit contenir au moins un caractère"
            ></mdl-textfield
            ><br />
            <mdl-select
                label="Type de rechargement"
                id="type-select"
                @input="updateDeepestFocusedElement({ field: 'type', value: $event })"
                :value="focusedMeanOfPayment.type"
                :options="typeOptions"
            ></mdl-select>
            <mdl-textfield
                v-if="focusedMeanOfPayment.type === 'unit'"
                floating-label="Valeur de l'unité (en centimes)"
                @input="updateDeepestFocusedElement({ field: 'step', value: $event })"
                :value="focusedMeanOfPayment.step"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-button colored raised>Modifier</mdl-button>
        </form>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            typeOptions: [
                { name: 'Numérique', value: 'numeric' },
                { name: 'Consigne', value: 'unit' }
            ]
        };
    },

    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateMeanOfPayment(meanOfPayment) {
            const fields = ['id', 'name', 'step', 'type'];
            this.updateObject({
                route: 'meansofpayment',
                value: pick(meanOfPayment, fields)
            })
                .then(() => this.notify({ message: 'Le moyen de paiement a bien été modifié' }))
                .catch(err =>
                    this.notifyError({
                        message:
                            'Une erreur a eu lieu lors de la modification du moyen de paiement',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedMeanOfPayment: state => state.app.focusedElements[0]
        })
    }
};
</script>
