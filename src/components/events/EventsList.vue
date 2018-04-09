<template>
    <div>
        <h5>Liste des événements</h5>
        <b-table
            :headers="[
                { title: 'Évenement', field: 'name', object: true },
                { title: 'Rechargement minimal', field: 'minReload', type: 'price' },
                { title: 'Solde maximal', field: 'maxPerAccount', type: 'price' },
                { title: 'Alcool maximal', field: 'maxAlcohol' }
            ]"
            :data="events"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'config', text: 'Configurer' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="events"
            :paging="10"
            @edit="editEvent"
            @config="configEvent"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['removeObject']),

        editEvent(event) {
            this.$router.push(`/events/${event.id}/edit`);
        },

        configEvent(event) {
            this.$router.push(`/events/${event.id}/config`);
        }
    },

    computed: {
        ...mapState({
            events: state => state.objects.events
        })
    }
};
</script>
