<template>
    <div class="b-details">
        <h3>Tickets restants sur la carte</h3>
        <div v-for="(item, i) in buyerCatering" :key="i">
            {{ getCateringName(item.id) }} : {{ item.balance }}
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    computed: mapState({
        buyerCatering: state => state.auth.buyer.catering,
        coupons: state => state.device.coupons
    }),

    methods: {
        getCateringName(id) {
            try {
                return this.coupons.find(entry => entry.id === id).name;
            } catch (err) {
                console.log('couldnt find id', id, err);
                return 'Inconnu';
            }
        }
    }
};
</script>

<style>
@import '../main.css';

.b-details {
    background-color: #f3f3f3;
    width: 100vw;
    text-align: center;
}
</style>
