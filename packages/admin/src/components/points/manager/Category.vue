<template>
    <div class="b-category">
        <router-link :to="`${categoryPath}/articles/add`" class="b-item">
            <div class="b-item__add">
                <b-icon name="add_circle_outline" :size="60" />
            </div>
        </router-link>
        <b-item
            v-for="article in tabArticles"
            :key="article.id"
            :article="article"
            :categoryPath="categoryPath"
        ></b-item>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import sortOrder from '@/lib/sortOrder';
import Item from './Item.vue';

export default {
    components: {
        'b-item': Item
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedPoint() {
            return this.focusedElements[0];
        },

        focusedCategory() {
            return this.focusedElements[1];
        },

        tabArticles() {
            const category = this.focusedCategory;

            if (!category.articles) {
                return [];
            }

            const fullArticles = category.articles.map(article => ({
                ...article,
                prices: (article.prices || []).filter(
                    price => price.point_id === this.focusedPoint.id
                )
            }));

            return [].concat(
                fullArticles
                    .filter(article => article.prices.length > 0)
                    .sort((a, b) => sortOrder(a.name, b.name)),
                fullArticles
                    .filter(article => article.prices.length === 0)
                    .sort((a, b) => sortOrder(a.name, b.name))
            );
        },

        categoryPath() {
            return `/points/${this.focusedPoint.id}/categories/${this.focusedCategory.id}`;
        }
    }
};
</script>

<style scoped>
@import '../../../styles/item.css';

.b-category {
    display: flex;
    flex-wrap: wrap;
}
</style>
