<template>
    <label class="checkbox-wrapper" :right="right" :accent="accent">
        <input v-if="!right" type="checkbox" class="input" :checked="checked" @change="onChange" />
        <span class="checkmark" v-if="!right">
            <div class="mark" />
        </span>

        <!-- @slot Checkbox label -->
        <slot />

        <input v-if="right" type="checkbox" class="input" :checked="checked" @change="onChange" />
        <span class="checkmark" v-if="right">
            <div class="mark" />
        </span>
    </label>
</template>

<script>
/**
 * Material-inspired checkbox
 */
export default {
    name: 'Checkbox',

    model: {
        prop: 'checked',
        event: 'change'
    },

    props: {
        /**
         * @model
         * Controls the checked prop and state
         */
        checked: { type: Boolean, default: false },

        /**
         * Makes the checkbox positionned to the right of the label
         */
        right: { type: Boolean, default: false },

        /**
         * Changes the checkbox checked color
         */
        accent: { type: Boolean, default: false }
    },

    methods: {
        onChange(e) {
            /**
             * Change input event (used by v-model)
             *
             * @event change
             * @type {boolean}
             */
            this.$emit('change', e.target.checked);
        }
    }
};
</script>

<style scoped>
.checkbox-wrapper {
    display: inline-flex;
    align-items: center;
    position: relative;
    cursor: pointer;
    color: var(--accent-foreground-300);
    user-select: none;
}

.input {
    position: absolute;
    cursor: pointer;
    transform: scale(0);
    height: 0;
    width: 0;
}

.checkmark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    width: 16px;
    margin-right: 8px;
    border: 2px solid var(--foreground-dark-100);
    border-radius: calc(var(--radius) / 2);
    background-color: var(--grey-100);
    transition: background-color var(--transition-fast-out) var(--transition-easing),
        border-color var(--transition-fast-out) var(--transition-easing);
}

[right] .checkmark {
    margin-right: 0;
    margin-left: 8px;
}

.mark {
    left: 9px;
    top: 5px;
    width: 4px;
    height: 10px;
    transform: rotate(45deg);
    margin-top: -2px;
    border-style: solid;
    border-color: var(--foreground-light-300);
    border-width: 0 2px 2px 0;
}

input:checked + .checkmark {
    background-color: var(--primary-300);
    border-color: var(--primary-300);
    transition-duration: var(--transition-fast-in);
}

[accent] input:checked + .checkmark {
    background-color: var(--accent-300);
    border-color: var(--accent-300);
}
</style>
