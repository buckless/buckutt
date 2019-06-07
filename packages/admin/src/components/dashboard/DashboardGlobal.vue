<template>
    <div class="b-dashboard-global">
        <b-global-tile
            icon="nfc"
            title="Supports NFC actifs"
            :value="globalData.activeCards"
            color="#ff7f0e"
        ></b-global-tile>
        <b-global-tile
            icon="map"
            title="Billets validés"
            :value="globalData.validatedTickets"
            color="#98df8a"
        ></b-global-tile>
        <b-global-tile
            icon="attach_money"
            title="Rechargements totaux"
            :value="globalData.reloads"
            color="#c7c7c7"
            type="price"
        ></b-global-tile>
        <b-global-tile
            icon="money_off"
            title="Remboursements totaux"
            :value="globalData.refunds"
            color="#9e5eba"
            type="price"
        ></b-global-tile>
        <b-global-tile
            icon="shopping_cart"
            title="Achats totaux"
            :value="globalData.purchases"
            color="#1f77b4"
            type="price"
        ></b-global-tile>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import GlobalTile from './GlobalTile';
import '../../lib/price';

export default {
    components: {
        'b-global-tile': GlobalTile
    },

    data() {
        return {
            nextUpdateRef: 0
        };
    },

    computed: {
        ...mapState({
            globalData: state => state.stats.globalData
        })
    },

    methods: {
        ...mapActions(['fetchGlobalData']),

        updateData() {
            clearTimeout(this.nextUpdateRef);

            return this.fetchGlobalData().then(() => {
                this.nextUpdateRef = setTimeout(this.updateData, 10000);
            });
        }
    },

    beforeDestroy() {
        clearTimeout(this.nextUpdateRef);
    },

    mounted() {
        this.updateData();
    }
};
</script>

<style>
.b-dashboard-global {
    display: grid;
    grid-gap: 20px;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    flex-wrap: wrap;
    width: 100%;
    margin-bottom: 20px;
}
</style>
