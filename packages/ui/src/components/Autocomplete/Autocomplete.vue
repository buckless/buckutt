<template>
    <label>
        <div class="label" v-if="label">{{ label }}</div>
        <vue-autosuggest
            :suggestions="mutableSuggestions"
            :inputProps="inputProps"
            :sectionConfigs="sections"
            :getSuggestionValue="getSuggestionValue"
        >
            <template slot-scope="{ suggestion }">
                <span class="my-suggestion-item">{{ suggestion.item.label }}</span>
            </template>
        </vue-autosuggest>
    </label>
</template>

<script>
import { VueAutosuggest } from 'vue-autosuggest';
import uniqueId from 'lodash.uniqueid';

import {
    isSuggestion,
    isSuggestions,
    isSections,
    matches
} from './utils';

/**
 * Wrapper around vue-autosuggest
 */
export default {
    name: 'Autocomplete',

    model: {
        prop: 'value',
        event: 'input'
    },

    components: {
        VueAutosuggest
    },

    props: {
        /**
         * @model
         * Controls the input value. Must be an id of a suggestion
         */
        value: { type: String, default: '' },

        /**
         * Array of sections
         */
        suggestions: {
            type: Array,
            required: true,
            validator: isSections
        },

        /**
         * Text label above the input
         */
        label: {
            type: String,
            default: '',
        },

        /**
         * Placeholder when input value is null
         */
        placeholder: {
            type: String,
            default: ''
        },

        /**
         * Disable the input
         */
        disabled: {
            type: Boolean,
            default: false
        },

        /**
         * Smaller input
         */
        small: {
            type: Boolean,
            default: false
        },

        /**
         * Adds elevation to input
         */
        elevation: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            id: uniqueId('@buckless/ui/autocomplete/'),
            mutableSuggestions: this.suggestions,
            inputProps: {
                id: this.id,
                onInputChange: this.onInputChange,
                class: 'input',
                // Add the input to the CSS scope
                [this.$options._scopeId]: '',

                placeholder: this.placeholder,
                disabled: this.disabled,
                initialValue: this.findValueFromId(this.value),
                small: this.small,
                elevation: this.elevation
            }
        };
    },

    computed: {
        sections() {
            return this.suggestions.reduce((left, right) => ({
                ...left,
                [right.name]: {
                    label: right.label,
                    onSelected: this.onSelected
                }
            }), {});
        }
    },

    methods: {
        onInputChange(input) {
            if (input === null) return;

            this.mutableSuggestions = this.suggestions
                .map(section => ({
                    ...section,
                    data: section.data.filter(entry => matches(input, entry.label))
                })
            )
        },

        onSelected(e) {
            this.$emit('input', e.item.id);
        },

        getSuggestionValue: (suggestion) => suggestion.item.label,

        findValueFromId(id) {
            const match = this.suggestions
                .map(section => section.data)
                .reduce((left, right) => [ ...left, ...right ], [])
                .find(suggestion => suggestion.id === id)

            return match ? match.label : '';
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

<style>
.autosuggest__input-open.input {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.autosuggest__input-open.input + .autosuggest__results-container {
    display: block;
}

.autosuggest__results-container {
    display: none;
    box-shadow: var(--elevation-1dp);
    padding: 16px;
    border-bottom-left-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
}

.autosuggest__results > ul {
    padding: 0;
    margin: 0;
    list-style: none;
}

.autosuggest__results > ul:not(:first-of-type) {
    margin-top: 16px;
}

.autosuggest__results_title {
    font-size: var(--typography-button-size);
    letter-spacing: var(--typography-button-spacing);
    font-weight: var(--typography-button-weight);
    text-transform: uppercase;
    color: var(--primary-300);
}

.autosuggest__results_item {
    height: 30px;
    display: flex;
    align-items: center;
    color: var(--foreground-dark-300);
    cursor: pointer;
    padding-left: 8px;
    background-color: transparent;
    border-radius: calc(var(--radius) / 2);
    transition: padding-left var(--transition-fast-out) var(--transition-easing),
                background-color var(--transition-fast-out) var(--transition-easing);
}

.autosuggest__results_item-highlighted {
    background-color: var(--grey-200);
    padding-left: 12px;
    transition: padding-left var(--transition-fast-in) var(--transition-easing),
                background-color var(--transition-fast-in) var(--transition-easing);
}

</style>
