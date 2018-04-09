<template>
    <div>
        <h5>Envoyer une alerte</h5>
        <p>
            <strong>Note:</strong> L'alerte ne sera envoyée qu'aux équipements de vente connectés au réseau.
        </p>
        <form @submit.prevent="createAlert(newAlert)">
            <mdl-textfield floating-label="Contenu" v-model="newAlert.content" required="required" error="Le contenu doit contenir au moins un caractère"></mdl-textfield>
            <br />
            <mdl-textfield floating-label="Durée minimale d'affichage (secondes)" v-model="newAlert.minimumViewTime" required="required" pattern="[0-9]+" error="La durée doit être exprimée en secondes"></mdl-textfield>
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
            newAlert: {
                content: '',
                minimumViewTime: 5
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),
        createAlert(alert) {
            alert.event_id = this.currentEvent.id;

            this.createObject({ route: 'alerts', value: alert })
                .then(() => {
                    this.notify({ message: "L'alerte a bien été envoyée" });
                    this.$router.push('/alerts');
                })
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de l'envoi de l'alerte",
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
