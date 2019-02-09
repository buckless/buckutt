<template>
    <div class="mode">
        <slot></slot>
    </div>
</template>

<style scoped>
.mode {
    padding: 12px;
    max-width: 300px;
    cursor: pointer;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.24);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    border-radius: 3px;
    transition: 0.1s ease border-color, 0.1s ease box-shadow;
}

.mode:hover {
    border-color: #1abc9c;
}

.mode > h2 {
    margin: 0 0 6px 0;
    font-size: 18px;
    font-weight: 500;
}

.mode > p {
    margin: 0;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.6);
}
</style>
