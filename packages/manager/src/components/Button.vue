<template>
  <button
    v-if="!to"
    :raised="raised"
    :small="small"
    class="button"
    @click="click">
    <slot/>
  </button>
  <router-link
    v-else
    :raised="raised"
    :small="small"
    :to="to"
    class="button">
    <slot/>
  </router-link>
</template>

<script>
export default {
    name: 'Button',

    props: {
        raised: { type: Boolean, default: false },
        small: { type: Boolean, default: false },
        to: { type: String, default: null }
    },

    methods: {
        click(...args) {
            this.$emit('click', ...args);
        }
    }
};
</script>

<style lang="scss" scoped>
$mdc-typography-font-family: 'Open Sans', sans-serif;

@import '@/theme.scss';
@import '@material/button/mixins';
@import '@material/feature-targeting/functions';

.button {
    @include mdc-button-base_($query: mdc-feature-all());
    @include mdc-button-shape-radius(2px);
    @include mdc-button-container-fill-color(transparent);
    @include mdc-button-ink-color($foreground);
    @include mdc-states($theme);
    @include mdc-button-horizontal-padding(1.25rem);
    letter-spacing: 0.05rem;
}

.button[small] {
    padding: 0.5rem 1rem;
    min-width: 0;
    height: auto;
}

.button[raised] {
    @include mdc-button-filled-accessible($theme);
}

.button[disabled] {
    color: $foreground;
}
</style>
