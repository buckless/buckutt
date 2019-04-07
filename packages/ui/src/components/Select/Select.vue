<template>
    <label>
        <div class="label" v-if="label">{{ label }}</div>
        <div class="select">
            <select :value="normalizedValue" @change="onChange">
                <option
                    v-for="(option, i) in normalizedOptions"
                    :key="i"
                    :value="option.value"
                    :disabled="option.disabled"
                >
                    {{ option.name }}
                </option>
            </select>
            <Icon name="keyboard_arrow_down" />
        </div>
    </label>
</template>

<script>
import Icon from '../Icon/Icon';
import { validator, normalize } from './options';

/**
 * Select input
 */
export default {
    name: 'Select',

    model: {
        prop: 'value',
        event: 'change'
    },

    components: {
        Icon
    },

    props: {
        /**
         * Text label above the select
         */
        label: { type: String, default: '' },

        /**
         * Select options. Either a string array, or an array of:
         * ```
         * {
         *   value: string,
         *   name?: string,
         *   disabled?: boolean
         * }
         * ```
         */
        options: { type: Array, validator, required: true },

        /**
         * @model
         * Controls the select value
         */
        value: { type: String, default: '' }
    },

    data() {
        const normalizedOptions = normalize(this.options);

        return {
            normalizedOptions,
            normalizedValue: this.value || (normalizedOptions.length && normalizedOptions[0].value)
        };
    },

    methods: {
        onChange(e) {
            if (e.target.selectedOptions && e.target.selectedOptions[0].value) {
                /**
                 * Change select value (used by v-model)
                 *
                 * @event change
                 * @type {text}
                 */
                this.$emit('change', e.target.selectedOptions[0].value);
            }
        }
    }
};
</script>

<style scoped>
.label {
    display: inline-block;
    margin-bottom: 4px;
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    font-weight: 600;
}

.select {
    display: inline-block;
    position: relative;
    width: 100%;
    height: 40px;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: var(--foreground-dark-200);
    background-color: var(--grey-50);
    border: 1px solid transparent;
    border-radius: var(--radius);
    transition: border-color 0.12s ease-in-out, box-shadow 0.12s ease-in-out;
    box-shadow: var(--elevation-1dp);
}

.select select {
    width: 100%;
    height: 100%;
    padding: 0 16px;
    font-size: 16px;
    border: none;
    box-shadow: none;
    background-color: transparent;
    background-image: none;
    appearance: none;
}

.select select:focus {
    outline: none;
}

.select .icon {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
}
</style>
