<template>
    <div class="b-protip">
        <div class="b-protip-circle">
            <b-icon :name="icon" :size="90" />
        </div>
        <h1>{{ title }}</h1>
        <p>{{ protip.text }}</p>
        <b-protip :subtitle="protip.subtitle" />
        <router-view name="create" :key="$route.path"></router-view>
    </div>
</template>

<script>
export default {
    props: {
        title: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        protip: {
            type: Object,
            required: true
        }
    }
};
</script>

<style scoped>
.b-protip {
    padding: 50px 0;
    margin: 0 auto;

    & > h1 {
        text-align: center;
        margin-top: 50px;
        margin-bottom: 5px;
    }

    & > p {
        text-align: center;
        margin-bottom: 50px;
    }

    & > .b-protip-circle {
        background-color: var(--primary-100);
        width: 200px;
        height: 200px;
        border-radius: 50%;
        padding: 55px;
        color: #fff;
        cursor: default;
    }

    & > div {
        margin: auto;
    }
}
</style>
