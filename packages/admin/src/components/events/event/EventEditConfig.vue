<template>
    <div>
        <h5>Configurer l'évenement</h5>
        <b-detailedswitch
            label="Groupes d'utilisateurs"
            icon="group"
            :value="focusedEvent.useGroups"
            @input="updateAndSaveFocusedElement({ field: 'useGroups', value: $event })"
        >
            Les groupes d'utilisateurs permettent d'associer des tarifs différents selon
            l'appartenance d'un client à un groupe.<br />
            <strong>Exemple:</strong> Ils peuvent être pratiques pour interdire la vente d'alcool
            aux mineurs, ou proposer des prix plus bas aux membres de votre équipe.
        </b-detailedswitch>

        <b-detailedswitch
            label="Fondations"
            icon="local_atm"
            :value="focusedEvent.useFundations"
            @input="updateAndSaveFocusedElement({ field: 'useFundations', value: $event })"
        >
            Les fondations permettent de répartir l'argent des ventes via le système entre plusieurs
            comptes virtuels.<br />
            <strong>Exemple:</strong> Si vous avez deux associations sur un même stand, et qu'elles
            souhaitent toutes les deux vendre leurs articles sur une même borne de vente, il est
            possible d'assigner les ventes d'une partie des articles à une association, et le reste
            à l'autre.
        </b-detailedswitch>

        <b-detailedswitch
            label="Périodes"
            icon="alarm"
            :value="focusedEvent.usePeriods"
            @input="updateAndSaveFocusedElement({ field: 'usePeriods', value: $event })"
        >
            Les périodes permettent d'établir des droits, ou des prix sur des laps de temps
            donnés.<br />
            <strong>Exemple:</strong> Mettre en place des happy hours sur une certaine durée, donner
            les droits de vente sur une certaine durée.
        </b-detailedswitch>

        <b-detailedswitch
            label="Mode dégradé"
            icon="signal_wifi_off"
            :value="focusedEvent.useCardData"
            @input="updateAndSaveFocusedElement({ field: 'useCardData', value: $event })"
        >
            Le mode autonome permet à votre événement de pouvoir continuer à utiliser la solution
            lors d'une perte de réseau, en écrivant sur les cartes ou bracelets de vos utilisateurs.
            Lors du retour de la connectivité, le système repasse automatiquement en mode normal.
        </b-detailedswitch>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateAndSaveFocusedElement(payload) {
            this.updateDeepestFocusedElement(payload).then(() =>
                this.updateEvent(this.focusedEvent)
            );
        },

        updateEvent(event) {
            const fields = ['id', 'useFundations', 'usePeriods', 'useGroups', 'useCardData'];

            this.updateObject({ route: 'events', value: pick(event, fields) })
                .then(() => this.notify({ message: 'La modification a bien été prise en compte' }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la configuration de l'événement",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedEvent: state => state.app.focusedElements[0]
        })
    }
};
</script>
