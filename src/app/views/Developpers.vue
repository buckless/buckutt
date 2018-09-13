<template>
    <div class="b-developpers">
        <h3>Synchronisation serveur</h3>
        <div>
            <syncData
                icon="event"
                :lastUpdate="eventSync.lastUpdate"
                :running="eventSync.locked"
                frequency="20 minutes"
                @update="updateEssentials">
                Données de l'événement
            </syncData>

            <template v-if="seller.isAuth">
                <syncData
                    icon="free_breakfast"
                    :lastUpdate="itemsSync.lastUpdate"
                    :running="itemsSync.locked"
                    frequency="10 minutes"
                    @update="updateStoredItems">
                    Liste des articles
                </syncData>

                <syncData
                    icon="group"
                    :lastUpdate="usersSync.lastUpdate"
                    :running="usersSync.locked"
                    frequency="5 minutes"
                    @update="updateUsersData">
                    Données des utilisateurs
                </syncData>

                <syncData
                    icon="alarm"
                    :lastUpdate="queueSync.lastUpdate"
                    :running="queueSync.locked"
                    frequency="1 minute"
                    @update="syncQueue">
                    Requêtes en attente
                </syncData>
            </template>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';
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
        seller: state => state.auth.seller
    }),

    methods: mapActions(['updateEssentials', 'updateStoredItems', 'updateUsersData', 'syncQueue'])
};
</script>

<style>
@import '../main.css';

.b-developpers {
    background-color: #f3f3f3;
    width: 100vw;
    text-align: center;

    & > div {
        max-width: 760px;
        margin: auto;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
    }
}
</style>
