<template>
    <div class="b-container-content-title">
        <div class="b-container-content-title-cicle">
            <b-icon :name="icon" :size="36"></b-icon>
        </div>
        <h3>{{ title }}</h3>
    </div>
</template>

<script>
export default {
    props: {
        icon: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: false
        }
    }
};
</script>

<style>
.b-container-content-title {
    display: flex;
    margin: 0 auto;
    justify-content: center;
    align-items: center;

    & > .b-container-content-title-cicle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: #c3c3c3;
        padding: 22px;
        margin-top: 5px;
        margin-right: 30px;
        display: inline-block;
    }

    & > h3 {
        font-size: 36px;
    }
}
</style>
