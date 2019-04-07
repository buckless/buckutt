<template>
    <div class="color" :style="style" @click="select">
        {{ main === 'fg' ? fg : bg }}
    </div>
</template>

<script>
export default {
    name: 'Color',

    props: ['bg', 'fg', 'main'],

    computed: {
        style() {
            return { backgroundColor: `var(${this.bg})`, color: `var(${this.fg})` };
        }
    },

    methods: {
        select() {
            window.getSelection().selectAllChildren(this.$el);
        }
    }
};
</script>

<style scoped>
.color {
    height: 50px;
    width: 200px;
    padding: 10px;
    margin: 5px 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
}
</style>
