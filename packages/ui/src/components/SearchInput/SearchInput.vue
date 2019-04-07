<template>
    <div :class="$style.searchWrapper">
        <Input
            v-bind="props"
            :class="$style.search"
            elevation
            @input="onInput"
            @keydown="onKeydown"
            @keyup="onKeyup"
            @keypress="onKeypress"
            @focus="onFocus"
            @blur.capture="onBlur"
        />
        <div :class="$style.icon">
            <Icon name="search" />
        </div>
    </div>
</template>

<script>
import Input from '../Input/Input';
import InputMixin from '../../mixins/Input';

/**
 * Rounded input with search icon
 */
export default {
    name: 'SearchInput',

    mixins: [InputMixin],

    components: { Input },

    data() {
        return {
            props: this.$props
        };
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

<style module>
.searchWrapper {
    position: relative;
}

.icon {
    position: absolute;
    top: 50%;
    right: 12px;
    transform: translateY(-50%);
    color: var(--foreground-dark-100);
}

.search input {
    border-radius: 20px !important;
}
</style>
