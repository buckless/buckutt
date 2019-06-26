<template>
    <div class="b-sidebar-refund">
        <div class="b-sidebar-refund__remove" @click="removeRefunds"></div>
        <div class="b-sidebar-refund__amount">
            <span>Remboursement</span>&nbsp;<currency :value="amount"></currency>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

import Currency from './Currency';

export default {
    components: {
        Currency
    },

    props: {
        amount: { type: Number, required: true }
    },

    methods: mapActions(['removeRefunds'])
};
</script>

<style scoped>
@import '../main.css';

.b-sidebar-refund {
    background: #fff;
    border-radius: 2px;
    box-shadow: 0 3px 2px color-mod($black a(0.25));
    display: flex;
    font-size: 18px;
    margin: 10px;
    padding: 10px;

    &:not(:first-child) {
        margin-top: 0;
    }
}

.b-sidebar-refund__amount {
    display: flex;
    flex: 1;
    align-items: center;
}

.b-sidebar-refund__remove {
    background-color: $orange;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    margin-right: 5px;
    position: relative;
    width: 30px;

    &:after {
        background-color: #fff;
        content: ' ';
        height: 3px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
    }
}
</style>
