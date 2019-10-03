<template>
    <Portal>
        <div class="container" @click="onClose">
            <div class="wrapper" @click.stop>
                <!-- @slot Modal slot -->
                <slot />
            </div>
        </div>
    </Portal>
</template>

<script>
import Portal from '../Portal/Portal';
import Icon from '../Icon/Icon';

/**
 * Modal container component.
 */
export default {
    name: 'ModalContainer',

    components: {
        Portal,
        Icon
    },

    props: {
        /**
         * Adds a drop shadow around the modal
         */
        dropShadow: { type: Boolean, default: true }
    },

    methods: {
        onClose() {
            /**
             * Close event (initied by drop shadow)
             *
             * @event close
             */
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: color-mod(var(--black) a(0.3));
    height: 100%;
    pointer-events: all;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
