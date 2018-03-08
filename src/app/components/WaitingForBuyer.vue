<template>
    <div class="b-waiting-for-buyer" v-if="waitingForBuyer || waitingForRewrite">
        <div
            class="b-waiting-for-buyer__drop"
            @click="cancelBuy"></div>
        <div class="b-waiting-for-buyer__modal">
            <div class="b-waiting-for-buyer__modal__text">
                <span v-if="waitingForRewrite" class="b-waiting-for-buyer__modal--error">L'écriture de la carte a échoué</span>
                <template v-else>Approchez la carte cashless</template>
                <span>Gardez le contact jusqu'à la validation du paiement</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    computed: mapState({
        waitingForBuyer  : state => state.basket.basketStatus === 'WAITING_FOR_BUYER',
        waitingForRewrite: state => state.basket.basketStatus === 'WAITING_FOR_REWRITE'
    }),

    methods: {
        cancelBuy() {
            if (!this.waitingForRewrite) {
                this.$store.commit('SET_BASKET_STATUS', 'WAITING');
            }
        }
    }
}
</script>

<style scoped>
@import '../main.css';

.b-waiting-for-buyer__drop {
    @add-mixin modal-drop;
}

.b-waiting-for-buyer__modal {
    @add-mixin modal 350px;

    font-size: 18px;
    font-weight: bold;
    padding: 30px 0;
    text-align: center;
}

.b-waiting-for-buyer__modal__text {
    & > span:first-child {
        display: inline-block;
        color: $red;
    }

    & > span:last-child {
        display: inline-block;
        margin: 10px 10px 0;
        font-size: 16px;
        font-weight: normal;
        color: $black !important;
    }
}
</style>
