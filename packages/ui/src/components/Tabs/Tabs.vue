<template>
    <div class="tabs-container">
        <div class="tabs" ref="tabs">
            <div
                class="tab"
                v-for="(title, i) in titles"
                :key="i"
                :active="i === selected"
                @click="select(i)"
            >
                {{ title }}
            </div>
            <div class="underline" v-if="positions" :style="underlineStyles" />
        </div>
        <div class="contents">
            <slot />
        </div>
    </div>
</template>

<script>
import { styles, positions } from './underline';

export { default as Tab } from './Tab';

/**
 * Tabs component
 */
export default {
    name: 'Tabs',

    model: {
        prop: 'selected',
        event: 'change'
    },

    props: {
        /**
         * @model
         * Controls the checked prop and state
         */
        selected: { type: Number, default: 0 }
    },

    data: () => ({
        titles: [],
        positions: []
    }),

    mounted() {
        this.titles = this.$children.map(child => child.$attrs.title);
        this.$nextTick(() => this.setPositions());
        this.setActiveTab();
    },

    computed: {
        underlineStyles() {
            return styles(this.positions[this.selected]);
        }
    },

    methods: {
        select(index) {
            /**
             * Tab changes
             *
             * @event change
             * @type {number}
             */
            this.$emit('change', index);

            this.$nextTick(() => this.setActiveTab());
        },

        setActiveTab() {
            this.$children.forEach((tab, index) => {
                tab.isActive = index === this.selected;
            });
        },

        setPositions() {
            this.positions = positions(this.$refs.tabs);
        }
    }
};
</script>

<style scoped>
.tabs-container {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.tabs {
    display: flex;
    align-self: center;
    position: relative;
    height: 40px;
    /* avoid changin border radius based on selected */
    overflow: hidden;
    margin-bottom: 12px;
    border: 1px solid var(--grey-600);
    background-color: var(--grey-50);
    border-radius: calc(var(--radius) / 2);
}

.tab {
    display: flex;
    align-items: center;
    padding: 0 16px;
    cursor: pointer;
}

.tab[active] {
    font-weight: 600;
}

.underline {
    position: absolute;
    bottom: 0;
    width: 100px;
    height: 3px;
    border-radius: 1px;
    background-color: var(--accent-300);
    transform-origin: left bottom;
    transition: transform var(--transition-medium-in) var(--transition-easing);
}
</style>
