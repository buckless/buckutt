<template>
    <div class="hero">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'Hero'
};
</script>

<style scoped>
.hero {
    position: relative;
    min-height: 330px;

    background-color: var(--grey-50);
    border-bottom: 1px solid color-mod(var(--black) a(12%));
}
</style>
