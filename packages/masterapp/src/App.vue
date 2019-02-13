<template>
    <div id="app">
        <Header />
        <router-view />
    </div>
</template>

<script>
import 'normalize.css';
import Header from '@/components/Header';

export default {
    components: {
        Header
    }
};
</script>

<style>
* {
    box-sizing: border-box;
}

html,
body,
#app {
    height: 100%;
}

#app {
    overflow: scroll;
}

body {
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

button {
    display: flex;
    height: 36px;
    min-width: 88px;
    padding: 0 8px;
    justify-content: center;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    background-color: #1abc9c;
    border-radius: 2px;
    border: 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    color: #fff;
    text-transform: uppercase;
    user-select: none;
    transform: 0.1s ease background-color;
}

button:hover,
button:focus {
    background-color: #1dd2af;
    outline: 0;
}
</style>
