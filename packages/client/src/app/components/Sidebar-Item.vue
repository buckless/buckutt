<template>
    <div class="b-sidebar-item" :class="{ 'b-sidebar-catering': type }">
        <div class="b-sidebar-item__minus" @click.stop="removeItemFromBasket({ id })"></div>
        <div class="b-sidebar-item__name">
            {{ name }}
        </div>
        <div class="b-sidebar-item__count">
            {{ count }}
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    props: ['id', 'name', 'count', 'type'],

    methods: mapActions(['removeItemFromBasket'])
};
</script>

<style scoped>
@import '../main.css';

.b-sidebar-item {
    background-color: #fff;
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

.b-sidebar-catering {
    background-color: #e6ffe6 !important;
}

.b-sidebar-item__minus {
    background-color: $orange;
    cursor: pointer;
    height: 30px;
    line-height: 30px;
    margin-right: 10px;
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

.b-sidebar-item__name {
    flex: 1;
    line-height: 30px;
}

.b-sidebar-item__count {
    background-color: color-mod($green a(0.75));
    color: #fff;
    height: 30px;
    line-height: 30px;
    text-align: center;
    width: 30px;
}
</style>
