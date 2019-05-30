<template>
    <Card>
        <Icon name="flash_on" :size="40" />
        <div class="text">
            <h6>{{ title }}</h6>
            <p>{{ subtitle }}</p>
        </div>
    </Card>
</template>

<script>
import Card from '../Card/Card';

/**
 * ProTip empty state helper
 */
export default {
    name: 'ProTip',

    props: {
        /**
         * ProTip header
         */
        title: { type: String, default: 'Pro Tip' },

        /**
         * ProTip advice
         */
        subtitle: { type: String, required: true }
    },

    components: {
        Card,
    }
};
</script>

<style scoped>
.card {
    display: flex;
    align-items: center;
    height: 100px;
    max-width: 600px;
    padding: 0 24px;
    color: var(--foreground-dark-300);
}

.icon {
    margin-right: 16px;
    color: var(--warning-300);
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
