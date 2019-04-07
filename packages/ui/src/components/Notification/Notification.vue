<template>
    <div class="notification">
        <slot />
        <div class="space"></div>
        <Button v-if="action" @click="onAction">
            {{ action }}
        </Button>
    </div>
</template>

<script>
import Button from '../Button/Button';

/**
 * Text notification
 */
export default {
    name: 'Notification',

    components: {
        Button
    },

    props: {
        /**
         * Action button content
         */
        action: { type: String }
    },

    methods: {
        onAction(e) {
            /**
             * Action button click
             *
             * @event action
             * @type {MouseEvent}
             */
            this.$emit('action', e);
        }
    }
};
</script>

<style scoped>
.notification {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 48px;
    padding-right: 24px;
    padding-left: 24px;
    background-color: var(--black);
    color: var(--foreground-light-300);
    border-radius: var(--radius);
}

.notification[active] {
    transform: translate(0);
}

.space {
    flex: 1;
}

.button {
    color: var(--primary-300);
}

.button:hover {
    color: var(--primary-200);
}

.button,
.button:hover,
.button:focus {
    background-color: transparent;
}
</style>
