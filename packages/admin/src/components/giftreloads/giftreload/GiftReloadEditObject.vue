<template>
    <div>
        <h5>Modifier l'offre</h5>
        <form @submit.prevent="updateGiftReload(focusedGiftReload)">
            <mdl-textfield
                floating-label="Montant offert (en centimes)"
                @input="updateDeepestFocusedElement({ field: 'amount', value: $event })"
                :value="focusedGiftReload.amount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-textfield
                floating-label="Tous les (en centimes)"
                @input="updateDeepestFocusedElement({ field: 'everyAmount', value: $event })"
                :value="focusedGiftReload.everyAmount"
                required="required"
                pattern="[0-9]+"
                error="Le montant doit être un entier"
            ></mdl-textfield
            ><br />
            <mdl-textfield
                floating-label="Montant minimal (en centimes)"
                @input="updateDeepestFocusedElement({ field: 'minimalAmount', value: $event })"
                :value="focusedGiftReload.minimalAmount"
                required="required"
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
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateGiftReload(giftReload) {
            const fields = ['id', 'amount', 'everyAmount', 'minimalAmount'];
            this.updateObject({
                route: 'giftreloads',
                value: pick(giftReload, fields)
            })
                .then(() => this.notify({ message: "L'offre a bien été modifiée" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'offre",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedGiftReload: state => state.app.focusedElements[0]
        })
    }
};
</script>
