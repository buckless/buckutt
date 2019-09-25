<template>
    <label class="toggle-wrapper" :accent="accent">
        <div>
            <input type="checkbox" class="input" :checked="checked" @change="onChange" />
            <div class="slider" />
        </div>
        <!-- @slot Toggle label -->
        <slot />
    </label>
</template>

<script>
/**
 * Material-inspired toggle
 */
export default {
    name: 'Toggle',

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
.toggle-wrapper {
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

.slider {
    position: relative;
    width: 36px;
    height: 14px;
    margin-right: 8px;
    border-radius: 8px;
    background-color: var(--grey-600);
    transition: background-color var(--transition-fast-in) var(--transition-easing);
}

.slider::after {
    content: '';
    position: absolute;
    z-index: 1;
    width: 20px;
    height: 20px;
    top: -3px;
    background-color: var(--grey-50);
    box-shadow: var(--elevation-1dp);
    border-radius: 10px;
    transform: translateX(0);
    transition: background-color var(--transition-fast-in) var(--transition-easing),
                transform var(--transition-fast-in) var(--transition-easing);
}

.input:checked + .slider {
    background-color: var(--primary-100);
}

.input:checked + .slider::after {
    transform: translateX(16px);
    background-color: var(--primary-300);
}

[accent] .input:checked + .slider {
    background-color: var(--accent-100);
}

[accent] .input:checked + .slider::after {
    background-color: var(--accent-300);
}
</style>
