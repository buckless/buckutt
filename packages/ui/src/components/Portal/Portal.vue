<template>
    <div>
        <slot />
    </div>
</template>

<script>
/**
 * Renders the content in <body>
 */
export default {
    name: 'Portal',

    mounted() {
        this.renderPortal();
    },

    updated() {
        this.renderPortal();
    },

    beforeDestroy() {
        document.body.removeChild(this.$el);
    },

    methods: {
        renderPortal() {
            document.body.appendChild(this.$el);
        }
    }
};
</script>
