<template>
    <div class="mdl-card mdl-shadow--2dp">
        <h3 class="b--capitalized">Bienvenue {{ loggedUser.firstname }} {{ loggedUser.lastname }}.</h3>
        Avant de commencer, n'oubliez pas de remplir vos différentes banques d'objets, via la barre située en haut de votre écran.<br /><br />
        Ensuite, sélectionnez l'événement auquel souhaitez accéder:<br />
        <div class="b-home__eventContainer">
            <b-eventtile
                v-for="event in events"
                :event="event"
                :key="event.id"
                @select="changeEvent(event)"
                @edit="editEvent(event)"
                @delete="deleteEvent(event)"></b-eventtile>

            <div class="add-card-event mdl-card" :class="{ 'mdl-shadow--2dp': !active, 'mdl-shadow--8dp': active }" @mouseover="active = true" @mouseleave="active = false" @click="createEvent()">
                <i class="material-icons">add_circle_outline</i>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import EventTile from '../events/home/EventTile.vue';

export default {
    components: {
        'b-eventtile': EventTile
    },

    data() {
        return {
            active: false
        };
    },

    methods: {
        ...mapActions(['updateCurrentEvent', 'removeObject']),

        changeEvent(event) {
            if (this.currentEvent) {
                if (event.id === this.currentEvent.id) {
                    return this.$router.push('/stats');
                }
            }

            this.updateCurrentEvent(event).then(() =>
                this.$router.push(`/events/${event.id}/config`)
            );
        },

        editEvent(event) {
            this.$router.push(`/events/${event.id}/edit`);
        },

        deleteEvent(event) {
            this.removeObject({
                route: 'events',
                value: event
            });
        },

        createEvent() {
            this.$router.push('/events/create');
        }
    },

    computed: {
        ...mapState({
            currentEvent: state => state.app.currentEvent,
            loggedUser: state => state.app.loggedUser,
            events: state => state.objects.events
        })
    }
};
</script>

<style>
.b-home__eventContainer {
    display: flex;
    flex-wrap: wrap;

    & > div {
        margin: 10px;
    }

    & > .add-card-event.mdl-card {
        width: 256px;
        height: 256px;
        background: #3e4eb8;
        cursor: pointer;

        & > i {
            color: white;
            font-size: 80px;
            margin: auto;
        }
    }
}
</style>
