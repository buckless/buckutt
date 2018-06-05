<template>
    <div class="b-items">
        <item
            v-for="item in tabsItems"
            :item="item"
            :key="item.id"></item>
        <nfc mode="read" @read="validate" v-if="!buyer.isAuth && isWaiting && !isWriting" key="read" />
        <nfc mode="write" @read="validate" @cancel="cancelBuy" v-if="isWriting" key="write" />
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';

import Item from './Items-Item';

export default {
    components: {
        Item
    },

    computed: {
        ...mapGetters(['tabsItems']),

        ...mapState({
            buyer: state => state.auth.buyer,
            isWaiting: state => state.basket.basketStatus === 'WAITING',
            isWriting: state => state.basket.writing
        })
    },

    methods: {
        ...mapActions({
            setBuyer: 'buyer'
        }),

        validate(cardNumber, credit, options) {
            console.log('items-validate', cardNumber, credit, options);
            this.setBuyer({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null,
                options,
                isOnlyAuth: this.isWaiting && !this.isWriting
            });
        },

        cancelBuy() {
            this.$store.commit('SET_WRITING', false);
            this.$store.commit('SET_BASKET_STATUS', 'WAITING');
        }
    }
};
</script>

<style scoped>
.b-items {
    width: 100%;
    height: 100%;
    padding: 10px 10px;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .b-items {
        background-color: #f3f3f3;
        text-align: center;
        padding: 10px 0px 60px 0px;
    }
}
</style>
