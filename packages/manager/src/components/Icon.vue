<template>
    <span v-if="name" :style="sizeStyle" class="material-icon">
        {{ name }}
    </span>
</template>

<script>
export default {
    name: 'Icon',

    props: {
        size: { type: Number, default: 1.5 },
        name: { type: String, required: true }
    },

    computed: {
        sizeStyle() {
            return { fontSize: `${this.size}rem` };
        }
    }
};
</script>

<style scoped>
@font-face {
    font-family: 'Material Icons';
    font-style: normal;
    font-weight: 400;
    src: local('Material Icons'), local('MaterialIcons-Regular'),
        url('../assets/material-icons/MaterialIcons-Regular.woff2') format('woff2'),
        url('../assets/material-icons/MaterialIcons-Regular.woff') format('woff');
}
/**
   * Based on Google guideline:
   * https://google.github.io/material-design-icons/#icon-font-for-the-web
   */
.material-icon {
    color: inherit;
    font-family: 'Material Icons';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    -moz-osx-font-smoothing: grayscale;
    font-feature-settings: 'liga';
}
</style>
