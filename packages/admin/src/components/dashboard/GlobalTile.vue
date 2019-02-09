<template>
    <div class="b-global mdl-card mdl-shadow--2dp">
        <div class="b-global__content mdl-card__supporting-text">
            <i class="material-icons b-global__icon" :style="{ color }">{{ icon }}</i>
            <div class="b-global__text">
                <div class="b-global__text-title">{{ title }}</div>
                <span class="b-global__text-value" v-if="type === 'price'">{{
                    value | price(true)
                }}</span>
                <span class="b-global__text-value" v-else>{{ value }}</span>
            </div>
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
    flex: 1 !important;
    width: 100%;
    min-height: 80px;
    height: 80px;

    & > .b-global__content {
        display: flex;
        width: 100%;

        & > .b-global__icon {
            font-size: 50px;
        }

        & > .b-global__text {
            text-align: right;
            flex: 1;

            & > .b-global__text-title {
                font-weight: 300;
                margin-bottom: 10px;
            }

            & > .b-global__text-value {
                font-size: 24px;
                font-weight: bold;
            }
        }
    }
}
</style>
