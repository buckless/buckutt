<template>
    <div class="datetime-range">
        <DateTimeInput class="foo" label="From" />
        <Icon name="arrow_forward" />
        <DateTimeInput class="foo" label="To" />
    </div>
</template>

<script>
import DateTimeInput from '../DateTimeInput/DateTimeInput';
import Icon from '../Icon/Icon';

export default {
    name: 'DateTimeRange',

    components: {
        DateTimeInput,
        Icon
    }
};
</script>

<style scoped>
.datetime-range {
    display: inline-flex;
    align-items: center;
}

.datetime-input {
    display: inline-flex;
    align-items: center;
    width: 150px;
}

.icon {
    margin: 0 8px;
    /* align-items: center takes label in the math */
    transform: translateY(8px);
    color: var(--foreground-dark-100);
}
</style>
