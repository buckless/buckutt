<template>
    <div class="autocomplete">
        <Input
            class="value"
            ref="input"
            :value="valueLabel"
            :label="label"
            :placeholder="placeholder"
            :small="small"
            @focus="open"
            readonly="readonly"
        />
        <Card class="menu" v-show="opened">
            <Input
                class="search"
                ref="input"
                v-model="search"
                :small="small"
                @input="onSearch"
                @blur="onBlur"
                @keydown.up.prevent="navigateUp"
                @keydown.down.prevent="navigateDown"
                @keydown.enter.prevent.stop="selectCurrent"
            />
            <div class="suggestions">
                <template v-if="activeSections">
                    <div class="section" v-for="section in activeSections" :key="section.id">
                        <div class="section-label">{{ section.label }}</div>

                        <div
                            class="suggestion"
                            v-for="suggestion in sectionSuggestions(section)"
                            :key="suggestion.id"
                            :active="hoveredId === suggestion.id"
                            @click.prevent.stop="select(suggestion)"
                            @mousedown="stopBlur"
                            @mouseenter="hover(suggestion.id)"
                        >
                            {{ suggestion.label }}
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div
                        class="suggestion"
                        v-for="suggestion in activeSuggestions"
                        :key="suggestion.id"
                        :active="hoveredId === suggestion.id"
                        @click.prevent.stop="select(suggestion)"
                        @mousedown="stopBlur"
                        @mouseenter="hover(suggestion.id)"
                    >
                        {{ suggestion.label }}
                    </div>
                </template>
            </div>
        </Card>
    </div>
</template>

<script>
import Popper from 'popper.js';

import Input from '../Input/Input';
import Card from '../Card/Card';

import { isSuggestions, isSections } from './utils';

export default {
    name: 'Autocomplete',

    model: {
        prop: 'value',
        event: 'input'
    },

    components: {
        Card,
        Input
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
        sections: {
            type: Array,
            validator: isSections
        },

        /**
         * Array of suggestions
         */
        suggestions: {
            type: Array,
            required: true,
            validator: isSuggestions
        },

        /**
         * Text label above the input
         */
        label: {
            type: String,
            default: ''
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

    data: () => ({
        opened: false,
        search: '',
        hoveredId: null,
        hoveredIndex: null,
        dontCloseOnBlur: false
    }),

    computed: {
        activeSections() {
            if (!this.sections) return null;
            if (!this.search) return this.sections;

            const allActiveSections = this.activeSuggestions.map(suggestion => suggestion.section);

            return this.sections.filter(section => allActiveSections.includes(section.id));
        },

        activeSuggestions() {
            if (!this.search) return this.suggestions;

            return this.suggestions.filter(this.match);
        },

        valueLabel() {
            const suggestion = this.suggestions.find(suggestion => suggestion.id === this.value);

            if (suggestion) {
                return suggestion.label;
            }
        }
    },

    methods: {
        open() {
            this.opened = true;
            this.$nextTick(() => {
                this.$refs.input.$el.querySelector('input').focus();
            });

            if (this.value) {
                this.selectValue();
            } else {
                this.selectFirstResult();
            }
        },

        close() {
            this.opened = false;
        },

        onBlur() {
            if (this.dontCloseOnBlur) {
                this.dontCloseOnBlur = false;
                return;
            }

            this.close();
        },

        onSearch() {
            this.$emit('search', this.search);
            this.selectFirstResult();
        },

        sectionSuggestions(section) {
            return this.suggestions
                .filter(suggestion => suggestion.section === section.id)
                .filter(this.match);
        },

        match(suggestion) {
            if (!this.search) return true;

            return suggestion.label.toLowerCase().includes(this.search.toLowerCase());
        },

        select(suggestion) {
            this.$emit('input', suggestion.id);
            this.close();
        },

        hover(suggestionId) {
            this.hoveredId = suggestionId;
            this.hoveredIndex = this.activeSuggestions.findIndex(
                suggestion => suggestion.id === suggestionId
            );
        },

        selectFirstResult() {
            this.$nextTick(() => {
                if (!this.activeSuggestions) {
                    return;
                }

                this.hoveredIndex = 0;
                this.hoveredId = this.activeSuggestions[this.hoveredIndex].id;
            });
        },

        navigateUp() {
            if (!this.activeSuggestions.length) {
                return;
            }

            if (!this.hoveredId || this.hoveredIndex === 0) {
                this.hoveredIndex = this.activeSuggestions.length - 1;
                this.hoveredId = this.activeSuggestions[this.hoveredIndex].id;
                return;
            }

            this.hoveredIndex = this.hoveredIndex - 1;
            this.hoveredId = this.activeSuggestions[this.hoveredIndex].id;
        },

        navigateDown() {
            if (!this.activeSuggestions.length) {
                return;
            }

            if (!this.hoveredId || this.hoveredIndex === this.activeSuggestions.length - 1) {
                this.hoveredIndex = 0;
                this.hoveredId = this.activeSuggestions[this.hoveredIndex].id;
                return;
            }

            this.hoveredIndex = this.hoveredIndex + 1;
            this.hoveredId = this.activeSuggestions[this.hoveredIndex].id;
        },

        selectCurrent() {
            this.$emit('input', this.activeSuggestions[this.hoveredIndex].id);
            this.close();
        },

        selectValue() {
            const valueSuggestionIndex = this.activeSuggestions.findIndex(
                suggestion => suggestion.id === this.value
            );

            this.hoveredIndex =
                typeof valueSuggestionIndex === 'number' ? valueSuggestionIndex : null;
        },

        stopBlur() {
            this.dontCloseOnBlur = true;
        }
    },

    mounted() {
        const reference = this.$el.querySelector('.input');
        const popper = this.$el.querySelector('.menu');
        this.popper = new Popper(reference, popper, {
            placement: 'bottom-start'
        });
    },

    beforeDestroy() {
        this.popper.destroy();
    }
};
</script>

<style scoped>
.autocomplete {
    position: relative;
}

.menu.card {
    margin: 0;
    width: 100%;

    border-top-right-radius: 0;
    border-top-left-radius: 0;
    z-index: 5;
}

.search {
    display: flex;
    margin-bottom: 12px;
}

.suggestions {
    max-height: 340px;
    overflow-y: auto;
}

.section-label {
    margin-top: 12px;
    color: var(--primary-300);
    font-weight: var(--typography-button-weight);
}

.suggestion {
    padding: 4px 0;
    background-color: var(--grey-50);
    cursor: pointer;
    transition: padding var(--transition-fast-out) var(--transition-easing),
        background-color var(--transition-fast-out) var(--transition-easing);
}

.suggestion[active] {
    background-color: var(--grey-200);
    padding: 4px 8px;
}
</style>
