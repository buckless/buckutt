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
            buyer    : state => state.auth.buyer,
            isWaiting: state => state.basket.basketStatus === 'WAITING',
            isWriting: state => state.basket.writing
        })
    },

    methods: {
        ...mapActions({
            setBuyer: 'buyer'
        }),

        validate(cardNumber, credit) {
            console.log('items-validate', cardNumber, credit);
            this.setBuyer({
                cardNumber,
                credit    : Number.isInteger(credit) ? credit : null,
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
    align-content: flex-start;
    box-sizing: border-box;
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    overflow-y: auto;
    padding: 10px;
    margin-bottom: 55px;
}

@media (max-width: 768px) {
    .b-items {
        background-color: #f3f3f3;
        padding-top: 15px;
    }
}
</style>
