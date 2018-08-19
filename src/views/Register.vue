<template>
  <div class="register">
    <h1>Inscription</h1>
    <router-view/>
  </div>
</template>

<script>
export default {
    name: 'Register'
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
