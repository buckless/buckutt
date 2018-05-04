<template>
    <div id="app">
        <Header />
        <router-view/>
    </div>
</template>

<script>
import Header from '@/components/Header'

export default {
    components: {
        Header
    }
}
</script>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    background-color: #fafafa;
}

#app {
    width: 100%;
    font-family: 'Roboto', sans-serif;
    color: #222;
}

h2 {
    font-size: 22px;
    font-weight: 500;
}
</style>
