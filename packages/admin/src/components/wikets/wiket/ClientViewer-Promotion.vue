<template>
    <router-link
        :to="toLink"
        class="b-promotion"
        :class="{ 'b-promotion--selected': selected, 'b-promotion--gray': gray }"
    >
        <i class="material-icons">stars</i>
        {{ promotion.name }}
    </router-link>
</template>

<script>
import { mapState } from 'vuex';

export default {
    props: {
        promotion: Object
    },

    computed: {
        ...mapState({
            focusedPromotion: state => state.app.focusedElements[2] || {},
            fullPath: state => state.route.fullPath
        }),

        selected() {
            return this.focusedPromotion.id === this.promotion.id;
        },

        gray() {
            return this.promotion.prices.length === 0;
        },

        toLink() {
            const basePath = this.fullPath
                .split('/')
                .slice(0, 5)
                .join('/');

            return `${basePath}/promotion/${this.promotion.id}`;
        }
    }
};
</script>

<style>
.b-promotion {
    width: 100%;
    display: flex;
    align-items: center;
    text-align: left;
    text-decoration: none;
    padding-left: 10px;
    color: #222 !important;
    text-transform: uppercase;
    padding: 7px 16px;

    &:hover {
        background-color: rgba(158, 158, 158, 0.2);
    }

    & > i {
        margin-right: 10px;
    }

    &--gray {
        color: #848281 !important;
    }

    &--selected {
        background: #e1e1e1 !important;
    }
}
</style>
