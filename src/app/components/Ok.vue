<template>
    <div :class="classes">
        <span v-if="status">Valide</span>
        <span v-else>Invalide</span>
    </div>
</template>

<script>
export default {
    props: {
        status: Boolean,
        default: true
    },

    computed: {
        classes() {
            return {
                'b-ok': true,
                'b-ok--not-ok': !this.status
            }
        }
    }
}
</script>

<style scoped>
@import '../main.css';

.b-ok {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--green);
    color: #fff;
    font-weight: bold;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2rem;
}

.b-ok--not-ok {
    background-color: var(--red);
}
</style>
