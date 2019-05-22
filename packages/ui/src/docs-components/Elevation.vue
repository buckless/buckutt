<template>
    <div class="elevation" :style="style" @click="select">
        <span>--elevation-{{ dp }}dp</span>
    </div>
</template>

<script>
export default {
    name: 'Elevation',

    props: ['dp'],

    computed: {
        style() {
            return { boxShadow: `var(--elevation-${this.dp}dp)` };
        }
    },

    methods: {
        select() {
            window.getSelection().selectAllChildren(this.$el.children[0]);
        }
    }
};
</script>

<style scoped>
.elevation {
    height: 100px;
    width: 200px;
    margin: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-radius: 4px;
}
</style>
