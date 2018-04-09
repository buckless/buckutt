<template>
    <div>
        <h5>Créer un événement</h5>
        <form @submit.prevent="createEvent(newEvent)">
            <mdl-textfield floating-label="Nom" v-model="newEvent.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield><br />
            <b-datetime-picker
                v-model="newPeriod.start"
                locale="fr"
                header-format="DD MMM"
                cancel="Annuler"
                next="Suivant"
                back="Retour"
                pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                error="Le début n'est pas une date"
                label="Début de l'événement"
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
                label="Fin de l'événement"
                class="b--limitsize b--inline"></b-datetime-picker>
            <h6>Options de l'événement</h6>
            <mdl-textfield floating-label="Rechargement minimal (en centimes)" v-model="newEvent.minReload" required="required" pattern="[0-9]+" error="Le montant doit être un entier"></mdl-textfield><br />
            <mdl-textfield floating-label="Solde maximal (en centimes)" v-model="newEvent.maxPerAccount" required="required" pattern="[0-9]+" error="Le montant doit être un entier"></mdl-textfield><br />
            <mdl-textfield floating-label="Unités alcool maximale/participant" v-model="newEvent.maxAlcohol" required="required" pattern="[0-9]+" error="Les unités doivent être un entier"></mdl-textfield><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            newEvent: {
                name: '',
                minReload: 0,
                maxPerAccount: 10000,
                maxAlcohol: 0
            },
            newPeriod: {
                start: null,
                end: null
            }
        };
    },

    computed: {
        ...mapState({
            devices: state => state.objects.devices,
            points: state => state.objects.points
        })
    },

    methods: {
        ...mapActions(['createObject', 'updateObject', 'notify', 'notifyError']),

        createEvent(event) {
            const defaultPromises = [
                this.createObject({ route: 'fundations', value: { name: event.name } }),
                this.createObject({ route: 'groups', value: { name: event.name } }),
                this.createObject({
                    route: 'periods',
                    value: { name: event.name, ...this.newPeriod }
                })
            ];

            let createdEvent;

            Promise.all(defaultPromises)
                .then(defaultObjects => {
                    event.defaultFundation_id = defaultObjects[0].id;
                    event.defaultGroup_id = defaultObjects[1].id;
                    event.defaultPeriod_id = defaultObjects[2].id;

                    return this.createObject({ route: 'events', value: event });
                })
                .then(createdEvent_ => {
                    createdEvent = createdEvent_;
                    return this.updateObject({
                        route: 'periods',
                        value: {
                            id: createdEvent.defaultPeriod_id,
                            event_id: createdEvent.id
                        }
                    });
                })
                .then(createdPeriod =>
                    this.createObject({
                        route: 'wikets',
                        value: {
                            period_id: createdPeriod.id,
                            device_id: this.devices.find(device => device.name === 'manager').id,
                            point_id: this.points.find(point => point.name === 'Internet').id
                        }
                    })
                )
                .then(() => {
                    this.notify({ message: "L'événement a bien été créé" });
                    this.$router.push(`/events/${createdEvent.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la création de l'événement",
                        full: err
                    })
                );
        }
    }
};
</script>
