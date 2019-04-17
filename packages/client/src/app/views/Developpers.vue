<template>
    <div class="b-developpers">
        <h3>Terminal</h3>
        <span class="b-developpers__value">{{ name }}</span>
        <h3>Synchronisation serveur</h3>
        <div class="b-developpers-sync">
            <syncData
                icon="event"
                :lastUpdate="eventSync.lastUpdate"
                :running="eventSync.locked"
                frequency="20 minutes"
                @update="updateEssentials"
            >
                Données de l'événement
            </syncData>

            <template v-if="sellerLogged">
                <syncData
                    icon="free_breakfast"
                    :lastUpdate="itemsSync.lastUpdate"
                    :running="itemsSync.locked"
                    frequency="10 minutes"
                    @update="updateItems"
                >
                    Liste des articles
                </syncData>

                <syncData
                    icon="group"
                    :lastUpdate="usersSync.lastUpdate"
                    :running="usersSync.locked"
                    frequency="2 minutes"
                    @update="updateUsersData"
                >
                    Données des utilisateurs
                </syncData>

                <syncData
                    icon="alarm"
                    :lastUpdate="queueSync.lastUpdate"
                    :running="queueSync.locked"
                    frequency="1 minute"
                    @update="syncQueue"
                >
                    Requêtes en attente
                </syncData>
            </template>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';
import SyncData from '@/components/SyncData';

export default {
    components: {
        SyncData
    },

    computed: mapState({
        usersSync: state => state.online.offline.usersData,
        eventSync: state => state.online.offline.eventEssentials,
        itemsSync: state => state.online.offline.items,
        queueSync: state => state.online.offline.queue,
        name: state => state.auth.device.name
    }),

    methods: {
        ...mapActions([
            'updateEssentials',
            'updateStoredItems',
            'updateUsersData',
            'syncQueue',
            'loadDefaultItems'
        ]),

        ...mapGetters(['sellerLogged']),

        updateItems() {
            this.updateStoredItems().then(() => this.loadDefaultItems());
        }
    }
};
</script>

<style>
@import '../main.css';

.b-developpers {
    background-color: #f3f3f3;
    width: 100vw;
    text-align: center;

    & > .b-developpers__value {
        font-size: 24px;
        font-family: monospace;
        letter-spacing: 3px;
    }

    & > div {
        max-width: 760px;
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
