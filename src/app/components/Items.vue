<template>
    <div class="b-items">
        <item
            v-for="item in tabsItems"
            :item="item"
            :key="item.id"></item>
        <nfc mode="read" @read="validate" />
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
            buyer: state => state.auth.buyer
        })
    },

    methods: {
        ...mapActions({
            setBuyer: 'buyer'
        }),

        validate(cardNumber, credit) {
            console.log('items-validate', cardNumber, credit);

            if (!this.buyer.isAuth) {
                if (Number.isInteger(credit)) {
                    this.setBuyer({
                        cardNumber,
                        credit
                    });
                } else {
                    this.setBuyer({
                        cardNumber
                    });
                }
            }
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
}

@media (max-width: 768px) {
    .b-items {
        background-color: #f3f3f3;
        padding-top: 15px;
    }
}
</style>
