<template>
    <div class="b-global">
        <b-icon :style="{ color }" :name="icon" :size="36" />
        <div class="b-global__text">
            <span class="b-global__text-value" v-if="type === 'price'">{{
                value | price(true)
            }}</span>
            <span class="b-global__text-value" v-else>{{ value }}</span>
            <div class="b-global__text-title">{{ title }}</div>
        </div>
    </div>
</template>

<script>
import '../../lib/price';

export default {
    props: {
        title: String,
        value: Number,
        type: String,
        color: String,
        icon: String
    }
};
</script>

<style>
.b-global {
    max-width: 160px;
    display: flex;
    align-items: center;

    &:not(:last-of-type) {
        margin-right: 24px;
    }

    & > .b-global__text {
        margin-left: 8px;
        flex: 1;

        & > .b-global__text-title {
            font-size: 14px;
            color: var(--foreground-dark-300);
        }

        & > .b-global__text-value {
            font-weight: bold;
            font-size: 20px;
        }
    }
}
</style>
