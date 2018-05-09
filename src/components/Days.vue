<template>
    <ul>
        <li
            v-for="(active, i) in mutableValue"
            @click.stop="toggle(i)"
            :active="active">Jour {{ i + 1 }}</li>
    </ul>
</template>

<script>
export default {
    props: ['value'],

    data() {
        return {
            // create a data that we can mutate before emitting
            mutableValue: Array.prototype.slice.call(this.value)
        };
    },

    methods: {
        toggle(i) {
            this.mutableValue[i] = !this.mutableValue[i];
            this.$emit('input', this.mutableValue);
            this.$forceUpdate();
        }
    }
};
</script>

<style scoped>
ul {
    display: flex;
    padding: 0;
    list-style: none;
}

li {
    flex: 1;
    padding: 8px 4px;
    color: rgba(32, 32, 32, 0.8);
    background-color: #bdc3c7;
    text-align: center;
    cursor: pointer;
}

li:not(:last-child) {
    border-right: 1px solid #fff;
}

li[active='true'] {
    color: #fff;
    background-color: #1abc9c;
}
</style>
