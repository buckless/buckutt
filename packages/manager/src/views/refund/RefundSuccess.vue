<template>
    <StateLayout :title="$t('views.refund.success.title')">
        {{ $t('views.refund.success.message') }}<br />
        <i18n path="views.refund.success.can" tag="span">
            <strong>{{ $t('views.refund.success.request') }}</strong>
        </i18n>
    </StateLayout>
</template>

<script>
import StateLayout from '../../layouts/State';

export default {
    components: {
        StateLayout
    }
};
</script>
