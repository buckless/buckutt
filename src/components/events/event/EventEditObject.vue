<template>
    <div>
        <h5>Modifier l'évenement</h5>
        <form @submit.prevent="updateEvent(focusedEvent)">
            <b-datetime-picker
                :value="new Date(defaultPeriod.start)"
                @input="updateDeepestFocusedElement({ field: 'defaultPeriod.start', value: $event })"
                locale="fr"
                header-format="DD MMM"
                cancel="Annuler"
                next="Suivant"
                back="Retour"
                pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                error="Le début n'est pas une date"
                label="Début"
                class="b--limitsize b--inline"></b-datetime-picker>
            <b-datetime-picker
                :value="new Date(defaultPeriod.end)"
                @input="updateDeepestFocusedElement({ field: 'defaultPeriod.end', value: $event })"
                locale="fr"
                header-format="DD MMM"
                cancel="Annuler"
                next="Suivant"
                back="Retour"
                pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                error="La fin n'est pas une date"
                label="Fin"
                class="b--limitsize b--inline"></b-datetime-picker>
            <br />

            <h6>Options de l'événement</h6>
            <mdl-textfield floating-label="Rechargement minimal (en centimes)" :value="focusedEvent.minReload" @input="updateDeepestFocusedElement({ field: 'minReload', value: $event })" required="required" pattern="[0-9]+" error="Le montant doit être un entier"></mdl-textfield><br />
            <mdl-textfield floating-label="Solde maximal (en centimes)" :value="focusedEvent.maxPerAccount" @input="updateDeepestFocusedElement({ field: 'maxPerAccount', value: $event })" required="required" pattern="[0-9]+" error="Le montant doit être un entier"></mdl-textfield><br />
            <mdl-textfield floating-label="Unités alcool maximales/participant" :value="focusedEvent.maxAlcohol" @input="updateDeepestFocusedElement({ field: 'maxAlcohol', value: $event })" required="required" pattern="[0-9]+" error="Les unités doivent être un entier"></mdl-textfield><br />
            <mdl-textfield floating-label="Prix du support NFC (en centimes)" :value="focusedEvent.cardCost" @input="updateDeepestFocusedElement({ field: 'cardCost', value: $event })" required="required" pattern="[0-9]+" error="Le montant doit être un entier"></mdl-textfield><br />
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

        updateEvent(event) {
            const fields = ['id', 'minReload', 'maxPerAccount', 'maxAlcohol', 'cardCost'];
            const defaultPeriodFields = ['id', 'start', 'end'];

            this.updateObject({
                route: 'periods',
                value: pick(event.defaultPeriod, defaultPeriodFields)
            })
                .then(() => this.updateObject({ route: 'events', value: pick(event, fields) }))
                .then(() => this.notify({ message: "L'événement a bien été modifié" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'événement",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedEvent: state => state.app.focusedElements[0]
        }),

        defaultPeriod() {
            return this.focusedEvent.defaultPeriod || {};
        }
    }
};
</script>
