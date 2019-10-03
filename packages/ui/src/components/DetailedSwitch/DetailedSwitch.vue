<template>
    <Card class="detailed-switch" @click.native="onChange">
        <div class="icon">
            <Icon :name="icon" :size="32" />
        </div>
        <div class="content">
            <h6>{{ label }}</h6>
            <p>
                <!-- @slot Switch description -->
                <slot />
            </p>
        </div>
        <div class="badge" :checked="checked">
            {{ checked ? 'Actif' : 'Inactif' }}
        </div>
    </Card>
</template>

<script>
import Card from '../Card/Card';
import Icon from '../Icon/Icon';

/**
 * A full-width card switch with icon, title and content
 */
export default {
    name: 'DetailedSwitch',

    components: {
        Card,
        Icon
    },

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
         * Switch title
         */
        label: { type: String, required: true },

        /**
         * Left icon
         */
        icon: { type: String, required: true }
    },

    methods: {
        onChange() {
            /**
             * Change input event (used by v-model)
             *
             * @event change
             * @type {boolean}
             */
            this.$emit('change', !this.checked);
        }
    }
};
</script>

<style scoped>
.detailed-switch {
    display: flex;
    align-items: center;
    cursor: pointer;
    user-select: none;
}

.content {
    flex: 1;
}

.icon {
    padding: 0 24px 0 16px;
    color: var(--foreground-dark-200);
}

h6 {
    margin-top: 0;
    margin-bottom: 4px;
    color: var(--foreground-dark-300);
    font-size: var(--typography-h6-size);
    letter-spacing: var(--typography-h6-spacing);
    font-weight: var(--typography-h6-weight);
}

p {
    margin: 0;
    max-width: 80%;
    color: var(--foreground-dark-300);
    font-size: var(--typography-body-1-size);
    letter-spacing: var(--typography-body-1-spacing);
    font-weight: var(--typography-body-1-weight);
}

.badge {
    padding: 4px 16px;
    border-radius: 40px;
    background-color: var(--warning-200);
    color: var(--foreground-dark-300);
    transition: background-color var(--transition-fast-in) var(--transition-easing);
}

.badge[checked] {
    background-color: var(--success-300);
}
</style>
