<template>
    <LoginLayout :title="$t('views.register.title')">
        {{ $t('views.register.success.valid') }}
        <br />
        {{ $t('views.register.success.mail') }}
    </LoginLayout>
</template>

<script>
import LoginLayout from '../../layouts/Login';

export default {
    components: {
        LoginLayout
    }
};
</script>
