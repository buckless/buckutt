<template>
    <div class="b-item" :class="{ 'b-item--selected': selectedItem > 0 }" @click="add(item)">
        <div class="b-item__image">
            <img draggable="false" height="100%" width="100%" />
        </div>
        <div class="b-item__price">
            <currency :value="item.price.amount"></currency>
            <i v-if="isPriceEditable" class="b-icon">create</i>
        </div>
        <div class="b-item__count" v-if="selectedItem > 0">{{ selectedItem }}</div>
        <div class="b-item__minus" v-if="selectedItem > 0" @click.stop="remove(item)"></div>
        <div class="b-item__text" ref="name" v-html="item.name"></div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import textSize from '@/utils/textSize';

import Currency from './Currency';

export default {
    props: {
        item: Object
    },

    components: {
        Currency
    },

    computed: {
        ...mapState({
            freePriceMode: state => state.ui.freePriceMode
        }),

        selectedItem() {
            return this.$store.state.items.basket.itemList.filter(
                article => article.id === this.item.id
            ).length;
        },

        isPriceEditable() {
            return this.item.freePrice && (this.item.price.amount === 0 || this.freePriceMode);
        }
    },

    methods: {
        ...mapActions({
            addToBasket: 'addItemToBasket',
            remove: 'removeItemFromBasket',
            getImage: 'getImage'
        }),

        add(item) {
            if (this.isPriceEditable) {
                return this.$router.push(`items/chooser/${item.id}`);
            }

            this.addToBasket(item);
        }
    },

    mounted() {
        const initialFontSize = 16;

        const $name = this.$refs.name;
        const size = textSize(this.item.name);

        // width - padding - padding - blue border
        const maxSize =
            this.$refs.name.getBoundingClientRect().width -
            parseInt(getComputedStyle(this.$refs.name).paddingLeft, 10) * 2 -
            4 * 2;

        if (size > maxSize) {
            $name.style.fontSize = `${initialFontSize * (maxSize / size)}px`;
        }

        if (initialFontSize * (maxSize / size) < 9) {
            $name.style.fontSize = '9px';
        }

        this.getImage(this.item.id)
            .then(image => {
                this.$el.querySelector('img').src = image;
            })
            .catch(() => {
                this.$el.querySelector('img').src = null;
            });
    }
};
</script>

<style scoped>
@import '../main.css';

.b-item {
    box-shadow: 0 0 2px color-mod($black a(0.25)), 0 2px 3px color-mod($black a(0.25));
    border-radius: 2px;
    cursor: pointer;
    height: 150px;
    margin: 10px;
    position: relative;
    width: 150px;
    display: inline-block;

    &--selected {
        border: 4px solid $lightblue;
    }
}

.b-item__image {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    & > img {
        &:before {
            background-image: url('../assets/placeholder.jpg');
            background-size: 100%;
            content: ' ';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
    }
}

.b-item__count,
.b-item__minus {
    background-color: $red;
    border-radius: 50%;
    color: #fff;
    font-weight: bold;
    height: 30px;
    line-height: 30px;
    position: absolute;
    right: -15px;
    text-align: center;
    top: -15px;
    width: 30px;
}

.b-item__minus {
    background-color: $orange;
    top: calc(50% - 15px);
    z-index: 2;

    &:after {
        background-color: #fff;
        content: ' ';
        height: 3px;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
    }
}

.b-item__text {
    background-color: rgba(255, 255, 255, 0.85);
    bottom: 0;
    height: 33px;
    line-height: 33px;
    overflow: hidden;
    padding: 0 10px;
    position: absolute;
    white-space: nowrap;
    width: 100%;
    text-overflow: ellipsis;
}

.b-item__price {
    background: $green;
    border-bottom-right-radius: 2px;
    color: #fff;
    left: 0;
    padding: 5px;
    position: absolute;
    top: 0;

    & > i {
        font-size: 14px;
        margin-left: 2px;
    }
}

@media (max-width: 768px) {
    .b-item {
        height: 90px;
        margin: 2.5%;
        margin-bottom: 10px;
        width: 90px;
    }

    .b-item__price {
        padding: 1px 2px;
        font-size: 14px;
    }
}
</style>
