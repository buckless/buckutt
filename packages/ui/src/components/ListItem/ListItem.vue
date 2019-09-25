<template>
    <Card :to="to" :active="active">
        <Icon :name="icon" :size="32" />
        <div class="text">
            <h6>{{ title }}</h6>
            <p>{{ subtitle }}</p>
        </div>
        <Icon name="keyboard_arrow_right" :size="32" />
    </Card>
</template>

<script>
import Card from '../Card/Card';
import Icon from '../Icon/Icon';

/**
 * List item
 */
export default {
    name: 'ListItem',

    components: {
        Card,
        Icon
    },

    props: {
        /**
         * Left icon
         */
        icon: { type: String, required: true },
        /**
         * name
         */
        title: { type: String, required: true },
        /**
         * Demphasized subtitle
         */
        subtitle: { type: String },
        /**
         * Link
         */
        to: { type: String, required: true },
        /**
         * Activation status
         */
        active: { type: Boolean, default: false }
    }
};
</script>

<style scoped>
.card {
    display: flex;
    align-items: center;
    height: 80px;
    padding: 0 24px;
    color: var(--foreground-dark-300);
}

.icon {
    margin-right: 16px;
    color: var(--foreground-dark-200);
}

.text {
    flex: 1;
}

h6 {
    font-family: var(--typography-family);
    font-size: var(--typography-h6-size);
    font-weight: var(--typography-h6-weight);
}

h6,
p {
    margin: 8px 0;
}
</style>
