<template>
    <div class="b-loading">
        <div class="b-loading__icon"></div>
        <div class="b-loading__close" v-if="closeable" @click="forceClose">Fermer</div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            closeable: false
        };
    },

    mounted() {
        this.timeout = setTimeout(() => {
            this.closeable = true;
        }, 7500);
    },

    methods: {
        forceClose() {
            this.$store.commit('SET_DATA_LOADED', true);
        }
    }
};
</script>

<style scoped>
@import '../main.css';

$loadingSize: 50px;

.b-loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: color($black a(0.75));
    z-index: 100;
}

.b-loading__icon {
    animation: spin 1s infinite linear;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: #fff;
    margin: 150px auto 0;
    height: $loadingSize;
    width: $loadingSize;
}

.b-loading__close {
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.24);
    color: $red;
    display: inline-block;
    font-weight: 500;
    left: 50%;
    margin-top: 24px;
    padding: 12px 16px;
    position: relative;
    transform: translateX(-50%);
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
