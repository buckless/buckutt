<template>
    <div class="fontSize" :style="style">
        {{ inside }}
    </div>
</template>

<script>
export default {
    name: 'FontSize',

    props: ['size', 'weight', 'ls', 'inside'],

    computed: {
        style() {
            return {
                fontSize: `var(${this.size})`,
                weight: `var(${this.weight})`,
                letterSpacing: `var(${this.ls})`
            };
        }
    }
};
</script>

<style scoped>
.fontSize {
    color: var(--foreground-light-300);
    background-color: var(--primary-300);
    padding: 10px;
}
</style>
