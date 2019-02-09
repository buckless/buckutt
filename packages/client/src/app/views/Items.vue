<template>
    <div class="b-items-wrapper">
        <div class="b-items">
            <div class="b-items__search" v-if="tabItems.length > itemsPerTab">
                <i class="b-icon">search</i>
                <input type="text" v-model="filter" placeholder="Filtre" />
                <i class="b-icon" @click="filter = ''">highlight_off</i>
            </div>
            <item v-for="item in displayedItems" :item="item" :key="item.id"></item>
            <nfc mode="read" @read="logBuyer" v-if="isWaiting && !isWriting" key="read" />
            <nfc mode="write" @read="validate" @cancel="cancelBuy" v-if="isWriting" key="write" />
        </div>
        <sidebar />
        <router-view />
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import fuzzy from 'fuzzy';

import Item from '@/components/Items-Item';
import Sidebar from '@/components/Sidebar';

export default {
    components: {
        Item,
        Sidebar
    },

    data() {
        return {
            filter: '',
            itemsPerTab: 50
        };
    },

    computed: {
        ...mapGetters(['tabItems']),

        ...mapState({
            buyer: state => state.auth.buyer,
            isWaiting: state => state.basket.basketStatus === 'WAITING',
            isWriting: state => state.basket.writing
        }),

        displayedItems() {
            const strongify = {
                extract: el => el.name,
                pre: '<strong>',
                post: '</strong>'
            };
            return fuzzy
                .filter(this.filter, this.tabItems, strongify)
                .map(item => ({
                    ...item.original,
                    name: item.string
                }))
                .slice(0, this.itemsPerTab - 1);
        }
    },

    methods: {
        ...mapActions(['buyerLogin', 'validateBasket']),

        logBuyer(cardNumber, credit, options) {
            console.log('items-buyer-login', cardNumber, credit, options);
            this.buyerLogin({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null,
                removeUnavailable: true
            });
        },

        validate(cardNumber, credit, options, version) {
            console.log('items-validate', cardNumber, credit, options);
            this.validateBasket({
                cardNumber,
                credit: Number.isInteger(credit) ? credit : null,
                options,
                version
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
.b-items-wrapper {
    display: flex;
    flex: 1;
}

.b-items {
    width: 100%;
    height: 100%;
    padding: 10px 10px;
    overflow-y: auto;

    & > .b-items__search {
        width: 500px;
        margin: auto;
        margin-bottom: 5px;
        color: #222;
        display: flex;
        align-items: center;

        & > input {
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.2);
            background-color: #fff !important;
            border-radius: 3px;
            flex: 1;
            text-align: center;
            background-color: transparent;
            height: 35px;
            font-size: 20px;
            border: none;
            outline: none;
        }

        & > i {
            margin: 0px 5px;

            &:last-child {
                cursor: pointer;
            }
        }
    }
}

@media (max-width: 768px) {
    .b-items {
        background-color: #f3f3f3;
        text-align: center;
        padding: 10px 0px 60px 0px;

        & > .b-items__search {
            max-width: 100%;

            & > input {
                width: calc(100% - 80px);
            }
        }
    }
}
</style>
