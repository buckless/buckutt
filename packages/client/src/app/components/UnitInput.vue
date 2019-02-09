<template>
    <div class="b-unit-input">
        Quantité rapportée:<br /><br />
        <button @click="decrement" :disabled="value <= 0">
            <i class="b-icon">remove</i>
        </button>
        <span>{{ displayedValue }}</span>
        <button @click="increment" :disabled="value >= 10 * unitPrice">
            <i class="b-icon">add</i>
        </button>
        <br /><br />
        <button class="b-unit-input__validate" @click="validate">Valider</button>
    </div>
</template>

<script>
export default {
    data() {
        return { unitPrice: 100 };
    },

    props: {
        value: { type: Number, default: 0 }
    },

    methods: {
        increment() {
            this.$emit('input', this.value + this.unitPrice);
        },

        decrement() {
            this.$emit('input', this.value - this.unitPrice);
        },

        clear() {
            this.$emit('input', 0);
            this.$emit('clear');
        },

        validate() {
            this.$emit('validate', this.value);
        }
    },

    computed: {
        displayedValue() {
            return this.value / this.unitPrice;
        }
    },

    mounted() {
        this.clear();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-unit-input {
    width: 100%;
    text-align: center;

    & > button {
        border-radius: 2px;
        box-shadow: 0 2px 4px color($black a(0.25));
        border: 0;
        width: 45px;
        height: 45px;
        color: $black;
        cursor: pointer;
        background-color: #fff;

        &:disabled {
            background-color: lightgrey;
            color: #fff;
            cursor: auto;
        }
    }

    & > .b-unit-input__validate {
        width: 100px;
        background-color: $green;
        color: #fff;
    }

    & > span {
        font-size: 30px;
        margin-left: 10px;
        margin-right: 10px;
        width: 30px;
        display: inline-block;
    }
}
</style>
