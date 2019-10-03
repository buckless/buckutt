<template>
    <label>
        <div class="label" v-if="label">{{ label }}</div>
        <input
            :type="type"
            :placeholder="placeholder"
            :disabled="disabled"
            :value="value"
            :maxlength="maxlength"
            :pattern="pattern"
            :step="step"
            :min="min"
            :max="max"
            :small="small"
            :elevation="elevation"
            :readonly="readonly"
            class="input"
            @input="onInput"
            @keydown="onKeydown"
            @keyup="onKeyup"
            @keypress="onKeypress"
            @focus="onFocus"
            @blur.capture="onBlur"
        />
    </label>
</template>

<script>
import InputMixin from '../../mixins/Input';

/**
 * Base text input
 */
export default {
    name: 'Input',

    mixins: [InputMixin],

    methods: {
        onInput(e) {
            /**
             * Change input value (used by v-model)
             *
             * @event input
             * @type {text}
             */
            this.$emit('input', e.target.value);
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

<style scoped>
.label {
    display: inline-block;
    margin-bottom: 4px;
    color: var(--foreground-dark-300);
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    font-weight: var(--typography-h6-weight);
}

.input {
    display: inline-block;
    width: 100%;
    height: 40px;
    padding: 0 16px;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--foreground-dark-200);
    background-color: var(--grey-50);
    border: 1px solid var(--grey-600);
    border-radius: var(--radius);
    transition: border-color 0.12s ease-in-out, box-shadow 0.12s ease-in-out;
}

.input[disabled] {
    background-color: var(--grey-200);
}

.input[small] {
    height: 30px;
    padding: 0 10px;
    font-size: var(--typography-body-2-size);
}

.input:focus {
    border-color: var(--primary-300);
    outline: 0;
    box-shadow: 0 0 0 3px color-mod(var(--primary-300) a(0.2));
}

.input:invalid {
    border-color: var(--error-300);
    outline: 0;
    box-shadow: 0 0 0 3px color-mod(var(--error-300) a(0.2));
}

.input[elevation] {
    border: 1px solid transparent;
    box-shadow: var(--elevation-1dp);
}

.input[elevation]:focus {
    border: 1px solid var(--primary-300);
    box-shadow: 0 0 0 3px color-mod(var(--primary-300) a(0.2));
}
</style>
