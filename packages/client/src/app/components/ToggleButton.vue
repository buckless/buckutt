<template>
    <div class="b-toggle-button">
        <button :active="!value" @click="$emit('input', 0)">{{ off }}</button>
        <button :active="!!value" @click="$emit('input', 1)">{{ on }}</button>
    </div>
</template>

<script>
export default {
    props: ['value', 'off', 'on']
};
</script>

<style scoped>
@import '../main.css';

.b-toggle-button {
    display: flex;
    margin-top: 20px;
    height: 40px;
    border: 2px solid $blue;
    border-radius: 5px;
}

button {
    flex: 1;
    padding: 0;
    border: 0;
    background-color: #fff;

    &:first-child {
        border-top-left-radius: 3px;
        border-bottom-left-radius: 3px;
    }

    &:last-child {
        border-left: 2px solid $blue;
        border-top-right-radius: 3px;
        border-bottom-right-radius: 3px;
    }

    &:focus {
        outline: 0;
    }

    &[active] {
        text-decoration: underline;

        &:first-child {
            background-color: $blue;
            color: #fff;
        }

        &:last-child {
            background-color: $red;
            color: #fff;
        }
    }
}
</style>
