<template>
    <StateLayout :title="$t('views.refund.failed.title')">
        {{ $t('views.refund.failed.message') }}<br />
        <i18n path="views.refund.failed.problem" tag="span">
            <strong>{{ $t('views.refund.failed.bank') }}</strong>
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
