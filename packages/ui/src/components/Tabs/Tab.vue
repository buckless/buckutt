<template>
    <div v-show="isActive">
        <!-- @slot Tab content -->
        <slot />
    </div>
</template>

<script>
export default {
    name: 'Tab',

    data: () => ({
        // will be set by Tabs container
        isActive: false
    })
};
</script>

<style scoped></style>
