<template>
    <Card class="modal">
        <div class="close" v-if="closeButton" @click="onClose">
            <Icon name="close" />
        </div>

        <div class="title" v-if="title">
            <h5>{{ title }}</h5>
        </div>

        <div class="content">
            <!-- @slot Modal content -->
            <slot />
        </div>

        <div class="space" />

        <div class="actions">
            <!-- @slot Modal actions buttons -->
            <slot name="actions" />
        </div>
    </Card>
</template>

<script>
import Card from '../Card/Card';
import Icon from '../Icon/Icon';

/**
 * Modal component.
 */
export default {
    name: 'Modal',

    components: {
        Card,
        Icon
    },

    props: {
        /**
         * Automatic title at the top of the modal
         */
        title: { type: String, default: '' },

        /**
         * Adds a close button
         */
        closeButton: { type: Boolean, default: true }
    },

    methods: {
        onClose() {
            /**
             * Close event (initied by close button)
             *
             * @event close
             */
            this.$emit('close');
        }
    }
};
</script>

<style scoped>
.modal {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 0;
    margin: 0;
    min-height: 300px;
    max-width: 500px;
    pointer-events: all;
}

.close {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
}

.content {
    padding: 24px 36px;
}

h5 {
    margin: 24px 36px 16px 36px;
    font-size: var(--typography-h5-size);
    letter-spacing: var(--typography-h5-spacing);
    font-weight: var(--typography-h5-weight);
}

.title + .content {
    padding-top: 0;
}

.space {
    flex: 1;
}

.actions {
    display: flex;
    justify-content: space-between;
    height: 80px;
    padding: 24px 36px;
    background-color: var(--grey-100);
    border-top: 1px solid var(--grey-200);
}

@media (max-width: 768px) {
    .modal {
        max-width: calc(100vw - 20px);
    }

    .ticket {
        margin-top: 0;
    }
}
</style>
