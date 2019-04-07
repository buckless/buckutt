<template>
    <button v-if="!to" class="button" :raised="raised" :accent="accent" @click="click">
        <!-- @slot Button text slot -->
        <slot />
    </button>
    <router-link v-else class="button" :raised="raised" :accent="accent" :to="to">
        <!-- @slot Button text slot -->
        <slot />
    </router-link>
</template>

<script>
/**
 * Material-inspired button
 */
export default {
    name: 'Button',

    props: {
        /**
         * Adds a background-color and add a shadow
         */
        raised: {
            type: Boolean,
            default: false
        },

        /**
         * Makes the button a link using vue-router's router-link
         */
        to: {
            type: String,
            default: null
        },

        /**
         * Changes the button color to be accent
         */
        accent: {
            type: Boolean,
            default: false
        }
    },

    methods: {
        click(...args) {
            /**
             * Click event
             *
             * @event click
             * @type {MouseEvent}
             */
            this.$emit('click', ...args);
        }
    }
};
</script>

<style scoped>
.button {
    display: inline-block;
    height: 36px;
    line-height: 36px;
    padding: 0 16px;

    border: 0;
    border-radius: var(--radius);
    cursor: pointer;
    font-family: var(--typography-family);
    font-weight: var(--typography-button-weight);
    font-size: var(--typography-button-size);
    letter-spacing: var(--typography-button-spacing);
    text-transform: uppercase;

    transition: background-color var(--transition-medium-out) var(--transition-easing);
}

.button:active,
.button:focus {
    outline: 0;
}

.button:hover {
    background-color: var(--primary-50);
    transition-duration: var(--transition-medium-in);
}

.button:focus {
    background-color: var(--primary-100);
}

.button:active {
    background-color: var(--primary-200);
}

.button[accent]:hover {
    background-color: var(--accent-50);
}

.button[accent]:focus {
    background-color: var(--accent-100);
}

.button[accent]:active {
    background-color: var(--accent-200);
}

.button[raised] {
    background-color: var(--primary-300);
    box-shadow: var(--elevation-2dp);
    color: var(--primary-foreground-300);
}

.button[raised]:hover {
    background-color: var(--primary-200);
}

.button[raised]:focus {
    background-color: var(--primary-200);
}

.button[raised]:active {
    background-color: var(--primary-400);
}

.button[accent][raised] {
    background-color: var(--accent-300);
    color: var(--accent-foreground-300);
}

.button[accent][raised]:hover {
    background-color: var(--accent-200);
}

.button[accent][raised]:focus {
    background-color: var(--accent-200);
}

.button[accent][raised]:active {
    background-color: var(--accent-400);
}
</style>
