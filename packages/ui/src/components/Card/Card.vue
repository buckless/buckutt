<template>
    <router-link
        v-if="to"
        tag="div"
        class="card is-link"
        :to="to"
        :active="active"
        :accent="accent"
        :hoverable="hoverable"
    >
        <!-- @slot Card content slot -->
        <slot />
    </router-link>
    <div v-else class="card" :active="active" :accent="accent" :hoverable="hoverable">
        <!-- @slot Card content slot -->
        <slot />
    </div>
</template>

<script>
/**
 * Material-inspired card
 */
export default {
    name: 'Card',

    props: {
        /**
         * Makes the card a link
         */
        to: {
            type: String,
            default: null
        },

        /**
         * Makes the card looks active
         */
        active: {
            type: Boolean,
            default: false
        },

        /**
         * Makes the active card border accentuated
         */
        accent: {
            type: Boolean,
            default: false
        },

        /**
         * Makes the card bordered on hover
         */
        hoverable: {
            type: Boolean,
            default: false
        }
    }
};
</script>

<style scoped>
.card {
    display: block;
    box-shadow: var(--elevation-1dp);
    border-radius: var(--radius);
    padding: 16px;
    margin: 16px;
    overflow: hidden;
    background-color: var(--grey-50);
}

.card[to],
.card.is-link {
    cursor: pointer;
    transition: box-shadow var(--transition-medium-out) var(--transition-easing);
}

.card[to]:not([active]):hover,
.card.is-link:not([active]):hover {
    box-shadow: var(--elevation-3dp);
    transition: box-shadow var(--transition-medium-in) var(--transition-easing);
}

.card[active] {
    /* keep two box shadows with same color to match css transition original box-shadow */
    box-shadow: inset 0 0 0 1px var(--primary-300), inset 0 0 0 2px var(--primary-300);
}

.card[active][accent] {
    /* keep two box shadows with same color to match css transition original box-shadow */
    box-shadow: inset 0 0 0 1px var(--accent-300), inset 0 0 0 2px var(--accent-300);
}
</style>
