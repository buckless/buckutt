<template>
    <div>
        <h5>Modifier la période</h5>
        <form @submit.prevent="updatePeriod(focusedPeriod)">
            <mdl-textfield
                floating-label="Nom"
                :value="focusedPeriod.name"
                @input="updateDeepestFocusedElement({ field: 'name', value: $event })"
                required="required"
                error="Le nom doit contenir au moins un caractère"
            ></mdl-textfield>
            <br />
            <b-datetime-picker
                :value="new Date(focusedPeriod.start)"
                @input="updateDeepestFocusedElement({ field: 'start', value: $event })"
                locale="fr"
                header-format="DD MMM"
                cancel="Annuler"
                next="Suivant"
                back="Retour"
                pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                error="Le début n'est pas une date"
                label="Début"
                class="b--limitsize b--inline"
            ></b-datetime-picker>
            <b-datetime-picker
                :value="new Date(focusedPeriod.end)"
                @input="updateDeepestFocusedElement({ field: 'end', value: $event })"
                locale="fr"
                header-format="DD MMM"
                cancel="Annuler"
                next="Suivant"
                back="Retour"
                pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                error="La fin n'est pas une date"
                label="Fin"
                class="b--limitsize b--inline"
            ></b-datetime-picker>
            <br />
            <mdl-button colored raised>Modifier</mdl-button>
        </form>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updatePeriod(period) {
            const fields = ['id', 'name', 'start', 'end'];

            this.updateObject({ route: 'periods', value: pick(period, fields) })
                .then(() => this.notify({ message: 'La période a bien été modifiée' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification de la période',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedPeriod: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['protectedPeriodsIds'])
    }
};
</script>
