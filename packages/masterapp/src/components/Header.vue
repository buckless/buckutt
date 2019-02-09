<template>
    <header>
        <img src="../assets/home.png" width="40" height="40" @click="home" v-if="!isHome" />
        <h1>{{ appName }}</h1>
    </header>
</template>

<script>
export default {
    data() {
        return {
            appName: process.env.VUE_APP_NAME,
            isHome: this.$route.path === '/'
        };
    },

    methods: {
        home() {
            this.$router.push('/');
        }
    },

    watch: {
        '$route.path'() {
            this.isHome = this.$route.path === '/';
        }
    }
};
</script>

<style scoped>
header {
    position: relative;
    height: 60px;
    line-height: 60px;
    background-color: #34495e;
    color: #fff;
    text-align: center;
}

h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 400;
}

img {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
}
</style>
