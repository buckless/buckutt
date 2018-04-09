<template>
    <div>
        <h5>Créer une période</h5>
        <form @submit.prevent="createPeriod(newPeriod)">
            <mdl-textfield floating-label="Nom" v-model="newPeriod.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
            <br />
            <b-datetime-picker
                v-model="newPeriod.start"
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
                v-model="newPeriod.end"
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
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            newPeriod: {
                name: '',
                start: null,
                end: null
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createPeriod(period) {
            period.event_id = this.currentEvent.id;

            this.createObject({ route: 'periods', value: period })
                .then(createdPeriod => {
                    this.notify({ message: 'La période a bien été créée' });
                    this.$router.push(`/periods/${createdPeriod.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la période',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            currentEvent: state => state.app.currentEvent
        })
    }
};
</script>
