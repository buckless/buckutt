<template>
    <div class="b-unit-input">
        <button @click.stop="decrement" :disabled="value <= 0">
            -
        </button>
        <span>{{ value }}</span>
        <button @click.stop="increment" :disabled="value >= maxNumber">
            +
        </button>
    </div>
</template>

<script>
export default {
    props: {
        value: { type: Number, default: 0 },
        maxNumber: { type: Number, default: 10 }
    },

    methods: {
        increment() {
            this.$emit('input', this.value + 1);
            this.$forceUpdate();
        },

        decrement() {
            this.$emit('input', this.value - 1);
            this.$forceUpdate();
        },

        clear() {
            this.$emit('input', 0);
            this.$forceUpdate();
        }
    },

    mounted() {
        this.clear();
    }
};
</script>

<style scoped>
.b-unit-input {
    width: 100%;
    text-align: center;
    display: flex;
}

.b-unit-input > button {
    border-radius: 2px;
    box-shadow: 0 2px 4px color(#222 a(0.25));
    border: 0;
    width: 30px;
    height: 40px;
    color: #222;
    cursor: pointer;
    background-color: #fff;
}

.b-unit-input > button:disabled {
    background-color: lightgrey;
    color: #fff;
    cursor: auto;
}

.b-unit-input > span {
    font-size: 30px;
    flex: 1;
}
</style>
