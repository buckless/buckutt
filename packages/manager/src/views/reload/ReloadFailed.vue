<template>
    <StateLayout :title="$t('views.reload.failed.title')">
        {{ $t('views.reload.failed.message') }}<br />
        <i18n path="views.reload.failed.problem" tag="span">
            <strong>{{ $t('views.reload.failed.bank') }}</strong>
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
