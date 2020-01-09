<template>
    <StateLayout :title="$t('views.reload.success.title')">
        {{ $t('views.reload.success.message') }}<br />
        <i18n path="views.reload.success.accept" tag="span">
            <strong>{{ $t('views.reload.success.mail') }}</strong>
        </i18n>
        <br />
        {{ $t('views.reload.success.delay') }}
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
