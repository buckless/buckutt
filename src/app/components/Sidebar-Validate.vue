<template>
    <button
        class="b-sidebar-validate"
        :class="statusClasses"
        @click="validate($event)">
        <span class="b-sidebar-validate__amount">
            <currency :value="-1 * basketAmount + reloadAmount" :showPlus="true"></currency>
        </span>
        <i class="b-icon" v-if="basketStatus === 'WAITING'">done_all</i>
        <i class="b-icon" v-if="basketStatus === 'DOING' || basketStatus === 'WAITING_FOR_BUYER'">query_builder</i>
        <i class="b-icon" v-if="basketStatus === 'ERROR'">error</i>
    </button>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex';

import Currency from './Currency';

export default {
    components: {
        Currency
    },

    computed: {
        statusClasses() {
            return {
                'b-sidebar-validate--doing':
                    this.basketStatus === 'DOING' || this.basketStatus === 'WAITING_FOR_BUYER',
                'b-sidebar-validate--error': this.basketStatus === 'ERROR'
            };
        },

        ...mapState({
            basketStatus: state => state.basket.basketStatus
        }),

        ...mapGetters(['basketAmount', 'reloadAmount'])
    },

    methods: {
        validate(e) {
            e.currentTarget.blur();

            this.sendBasket();
        },

        ...mapActions(['sendBasket', 'clearBasket'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-sidebar-validate {
    align-items: center;
    background-color: $green;
    border: 0;
    color: #fff;
    cursor: pointer;
    display: flex;
    height: 55px;
    justify-content: center;
    line-height: 0;

    & > .b-icon {
        font-size: 40px;
    }

    &--doing {
        background-color: $lightorange;
    }

    &--error {
        background-color: $red;
    }
}

.b-sidebar-validate__amount {
    font-size: 24px;
    font-weight: bold;
    margin-right: 10px;
}

@media (max-width: 768px) {
    .b-sidebar-validate {
        bottom: 24px;
        right: 24px;
        position: fixed;
        justify-content: flex-start;
        padding: 0 24px;
        border-radius: 55px;
        box-shadow: 0 2px 4px rgba(0,0,0,.3);
    }
}
</style>
