<template>
    <div class="register">
        <h1>Inscription</h1>
        <router-view />
    </div>
</template>

<script>
import { allowRegistration } from 'config/manager';

export default {
    name: 'Register',

    mounted() {
        if (allowRegistrations !== '1') {
            this.$router.push('/');
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.register {
    padding: 1.5rem;
    max-width: 700px;
    margin: 0 auto;
}
</style>
