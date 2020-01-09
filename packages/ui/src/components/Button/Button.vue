<template>
    <button
        v-if="!to"
        class="button"
        :type="type"
        :raised="raised"
        :accent="accent"
        :whiteBackground="whiteBackground"
        :disabled="disabled"
        @click="click"
    >
        <!-- @slot Button text slot -->
        <slot />
    </button>
    <router-link
        v-else
        class="button"
        :type="type"
        :raised="raised"
        :accent="accent"
        :disabled="disabled"
        :to="to"
    >
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
         * Button type
         */
        type: {
            type: String,
            default: 'submit'
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
        },

        /**
         * Sets the background on white + alpha instead of accent
         * Useful when you have a flat button on a accent-themed component
         */
        whiteBackground: {
            type: Boolean,
            default: false
        },

        /**
         * Sets the button disabled
         */
        disabled: {
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
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    line-height: 36px;
    padding: 0 16px;
    min-width: 65px;

    background-color: transparent;
    border: 0;
    border-radius: var(--radius);
    color: var(--foreground-dark-300);
    cursor: pointer;
    font-family: var(--typography-family);
    font-weight: var(--typography-button-weight);
    font-size: var(--typography-button-size);
    letter-spacing: var(--typography-button-spacing);
    text-transform: uppercase;
    text-decoration: none;

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

.button[whiteBackground]:hover {
    background-color: rgba(255,255,255,.12);
}

.button[whiteBackground]:focus {
    background-color: rgba(255,255,255,.24);
}

.button[whiteBackground]:active {
    background-color: rgba(255,255,255,.36);
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
    color: var(--foreground-light-300);
    background-color: var(--primary-300);
    box-shadow: var(--elevation-2dp);
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
    color: var(--foreground-dark-300);
    background-color: var(--accent-300);
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

.button[disabled],
.button[disabled]:hover,
.button[disabled]:focus,
.button[disabled]:active {
    color: var(--foreground-dark-100);
    background-color: transparent;
}

.button[disabled][raised],
.button[disabled][raised]:hover,
.button[disabled][raised]:focus,
.button[disabled][raised]:active {
    color: var(--foreground-dark-100);
    background-color: var(--grey-400);
}
</style>
