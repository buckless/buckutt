<template>
  <div
    :to="to"
    class="card"
    @click="navigate">
    <slot/>
  </div>
</template>

<script>
export default {
    name: 'Card',

    props: {
        to: { type: String, default: null }
    },

    methods: {
        navigate() {
            if (this.to) {
                this.$router.push(this.to);
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    padding: 1rem;
    margin: 1rem;
    background-color: $cardBackground;
}

.card[to] {
    cursor: pointer;
}
</style>
