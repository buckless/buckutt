<template>
    <div class="list">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'List'
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

$border: get-foreground-color($cardBackground, rgba(0, 0, 0, 0.2), rgba(255, 255, 255, 0.2));
$hover: get-foreground-color($cardBackground, rgba(0, 0, 0, 0.04), rgba(255, 255, 255, 0.04));

.list {
    border: 1px solid $border;
    border-radius: 3px;
}

.list > .item {
    display: flex;
    align-items: center;
    padding: 0.5rem;
    cursor: pointer;

    &:hover {
        background-color: $hover;
    }

    &:not(:last-child) {
        border-bottom: 1px solid $border;
    }
}
</style>

<style lang="scss">
@import '@/theme.scss';

.list > .item > .bullet {
    height: 10px;
    width: 10px;
    border-radius: 100%;
    background-color: $theme;
}
</style>
