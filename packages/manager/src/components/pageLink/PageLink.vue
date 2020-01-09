<template>
    <router-link v-if="to" :to="to" class="pageLink"><slot /></router-link>
    <a v-else-if="href" :href="href" class="pageLink"><slot /></a>
    <span v-else class="pageLink" @click="handleClick"><slot /></span>
</template>

<script>
export default {
    props: {
        to: {
            type: String,
            required: false
        },

        href: {
            type: String,
            required: false
        }
    },

    methods: {
        handleClick(e) {
            this.$emit('click', e);
        }
    }
};
</script>

<style scoped>
.pageLink {
    color: var(--foreground-dark-100);
    cursor: pointer;
    text-decoration: none;
    font-weight: 600;
}
</style>
