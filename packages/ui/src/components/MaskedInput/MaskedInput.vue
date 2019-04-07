<template>
    <Input
        v-bind="props"
        @input="onInput"
        @keydown="onKeydown"
        @keyup="onKeyup"
        @keypress="onKeypress"
        @focus="onFocus"
        @blur.capture="onBlur"
    />
</template>

<script>
import Cleave from 'cleave.js';
import omit from './omit';
import Input from '../Input/Input';
import InputMixin from '../../mixins/Input';

/**
 * Input with [cleave.js](https://nosir.github.io/cleave.js/)
 */
export default {
    name: 'MaskedInput',

    mixins: [InputMixin],

    props: {
        options: { type: Object, required: true }
    },

    components: { Input },

    data() {
        const props = omit(this.$props, ['options']);

        return {
            props
        };
    },

    mounted() {
        this.cleave = new Cleave(this.$el.querySelector('input'), this.options);
    },

    beforeDestroy() {
        this.cleave.destroy();
    },

    methods: {
        onInput(value) {
            /**
             * Change input value (used by v-model)
             *
             * @event input
             * @type {text}
             */
            this.$emit('input', value);
        },

        onKeydown(e) {
            /**
             * Keydown event
             *
             * @event keydown
             * @type {KeyboardEvent}
             */
            this.$emit('keydown', e);
        },

        onKeyup(e) {
            /**
             * Keyup event
             *
             * @event keyup
             * @type {KeyboardEvent}
             */
            this.$emit('keyup', e);
        },

        onKeypress(e) {
            /**
             * Keypress event
             *
             * @event keypress
             * @type {KeyboardEvent}
             */
            this.$emit('keypress', e);
        },

        onFocus(e) {
            /**
             * Focus event
             *
             * @event focus
             * @type {FocusEvent}
             */
            this.$emit('focus', e);
        },

        onBlur(e) {
            /**
             * Blur event
             *
             * @event blur
             * @type {FocusEvent}
             */
            this.$emit('blur', e);
        }
    }
};
</script>
