<template>
    <div class="b-input-slider">
        <div class="number" :active="value === 1" @click="$emit('input', 1)">1</div>
        <div class="number" :active="value === 2" @click="$emit('input', 2)">2</div>
        <div class="number" :active="value === 3" @click="$emit('input', 3)">3</div>
        <div class="number" :active="value === 4" @click="$emit('input', 4)">4</div>
        <div class="number" :active="value === 5" @click="$emit('input', 5)">5+</div>
    </div>
</template>

<script>
export default {
    props: ['value']
};
</script>


<style scoped>
@import '../main.css';

.b-input-slider {
    display: flex;
    margin-top: 5px;
    border: 2px solid $blue;
    height: 40px;
    border-radius: 5px;
}

.number {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;

    &:first-child {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }

    &:last-child {
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }

    &[active] {
        &:nth-child(1) {
            background-color: color($lightorange blend($red 0%));
        }

        &:nth-child(2) {
            background-color: color($lightorange blend($red 25%));
        }

        &:nth-child(3) {
            background-color: color($lightorange blend($red 50%));
        }

        &:nth-child(4) {
            background-color: color($lightorange blend($red 75%));
        }

        &:nth-child(5) {
            background-color: color($lightorange blend($red 100%));
        }
    }
}
</style>
