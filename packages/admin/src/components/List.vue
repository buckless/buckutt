<template>
    <div class="b-list" v-if="elements.length > 0">
        <ul class="mdl-list" v-for="(list, index) in lists" :key="index">
            <li
                class="mdl-list__item"
                :class="{
                    'mdl-list__item--two-line':
                        element.title !== undefined && element.content !== undefined
                }"
                v-for="(element, index) in list"
                :key="index"
                @click="redirect(element)"
            >
                <span class="mdl-list__item-primary-content">
                    <i class="material-icons mdl-list__item-avatar">{{ element.icon }}</i>
                    <span class="mdl-list__item-sub-title" v-if="element.title">{{
                        element.title
                    }}</span>
                    <span v-if="element.type === 'price' && element.content !== undefined">{{
                        element.content | price(true)
                    }}</span>
                    <span v-else-if="element.content !== undefined">{{ element.content }}</span>
                </span>
                <span class="mdl-list__item-secondary-content" v-if="element.right">
                    <span class="mdl-list__item-secondary-info">{{ element.right.top }}</span>
                    <span class="mdl-list__item-secondary-info">{{ element.right.bottom }}</span>
                </span>
            </li>
        </ul>
    </div>
</template>

<script>
import '../lib/price';

export default {
    props: {
        elements: Array,
        columns: {
            type: Number,
            required: false,
            default: 1
        }
    },

    methods: {
        redirect(element) {
            if (element.url) {
                this.$router.push(element.url);
            }
        }
    },

    computed: {
        lists() {
            const lists = [];
            const elementsNumber = this.elements.length;
            const elementsPerList = Math.ceil(elementsNumber / this.columns);

            for (let i = 0; i < this.columns; i += 1) {
                const list = [];
                for (
                    let j = i * elementsPerList;
                    j < (i + 1) * elementsPerList && j < elementsNumber;
                    j += 1
                ) {
                    list.push(this.elements[j]);
                }

                if (list.length > 0) {
                    lists.push(list);
                }
            }

            return lists;
        }
    }
};
</script>

<style>
.b-list {
    display: flex;
    flex-direction: line;
    flex-wrap: wrap;

    & > ul {
        flex-grow: 1;
        min-width: 250px;
        max-width: 600px;
        margin: 0px;
        padding-top: 0px;
        padding-bottom: 0px;
    }
}
</style>
