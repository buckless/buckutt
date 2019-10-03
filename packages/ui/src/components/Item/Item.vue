<template>
    <div class="item" :active="isActive" @click="increase">
        <div class="image">
            <!-- @slot Item background image -->
            <slot />
        </div>
        <div class="content">
            <div class="price">{{ priceAsString }}</div>
            <div class="banner">
                <span class="name">{{ name }}</span>
                <span v-if="isActive" class="count">{{ count }}</span>
            </div>
            <button v-if="isActive" type="button" class="minus" @click="decrease" />
        </div>
    </div>
</template>

<script>
import { format } from 'ui/src/utils/currency';

/**
 * Client basket item
 */
export default {
    name: 'Item',

    props: {
        /**
         * Item name
         */
        name: { type: String, required: true },

        /**
         * Item price in cents
         */
        price: { type: Number, required: true }
    },

    data: () => ({
        count: 0
    }),

    computed: {
        priceAsString() {
            return format(this.price);
        },

        isActive() {
            return this.count > 0;
        }
    },

    methods: {
        increase() {
            this.count += 1;
        },

        decrease(e) {
            e.stopPropagation();
            this.count -= 1;
        }
    }
};
</script>

<style scoped>
.item {
    position: relative;
    width: calc(165px + 6px);
    height: calc(115px + 6px);
    border: 3px solid var(--primary-100);
    border-radius: var(--radius);
    user-select: none;
    cursor: pointer;
}

[active] {
    border-color: var(--accent-300);
}

.image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    border-radius: 1px;
}

.content {
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
}

.count {
    font-weight: var(--typography-button-weight);
}

.price {
    position: absolute;
    top: -3px;
    left: -3px;
    display: flex;
    justify-content: center;
    align-items: center;

    width: 60px;
    height: 28px;

    background-color: var(--primary-100);
    border-top-left-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
}

[active] .price {
    background-color: var(--accent-300);
}

.banner {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: color-mod(var(--grey-50) a(0.8));
    border-bottom-left-radius: 1px;
    border-bottom-right-radius: 1px;
    color: var(--foreground-dark-300);
}

.minus {
    position: absolute;
    top: -8px;
    right: -8px;
    height: 32px;
    width: 32px;
    border: 0;
    border-radius: 16px;
    background-color: var(--error-300);
    cursor: pointer;
}

.minus::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    height: 3px;
    width: 16px;
    transform: translate(-50%, -50%);
    background-color: var(--grey-50);
    border-radius: 6px;
}

.minus:focus {
    outline: 0;
}
</style>
