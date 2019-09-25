<template>
    <router-link :to="toLink" class="b-item" :class="{ 'b-item--selected': selected }">
        <div class="b-item__image">
            <img :src="image" draggable="false" height="100%" width="100%" />
        </div>
        <div class="b-item__delete">
            <b-confirm @confirm="unlinkArticle()">&times;</b-confirm>
        </div>
        <div class="b-item__text" ref="name">{{ article.name }}</div>
        <div class="b-item__grayfilter" v-if="gray">Pas de prix défini</div>
    </router-link>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { getImage } from '@/lib/fetchImages';
import textSize from '@/lib/textSize';

export default {
    props: {
        article: Object,
        categoryPath: String
    },

    data() {
        return {
            image: null
        };
    },

    methods: {
        ...mapActions(['removeRelation', 'notify']),

        async unlinkArticle() {
            await this.removeRelation({
                obj1: {
                    route: 'categories',
                    value: this.focusedCategory
                },
                obj2: {
                    route: 'articles',
                    value: this.article
                }
            });

            this.notify("L'article a bien été retiré de la catégorie");
        }
    },

    computed: {
        ...mapGetters(['focusedElements']),

        focusedCategory() {
            return this.focusedElements[1];
        },

        focusedArticle() {
            return this.focusedElements[2] || {};
        },

        selected() {
            return this.focusedArticle.id === this.article.id;
        },

        gray() {
            return this.article.prices.length === 0;
        },

        toLink() {
            return `${this.categoryPath}/articles/${this.article.id}`;
        }
    },

    mounted() {
        const initialFontSize = 16;

        const $name = this.$refs.name;
        const size = textSize(this.article.name);
        const maxSize = 130;

        if (size > maxSize) {
            $name.style.fontSize = `${initialFontSize * (maxSize / size)}px`;
        }

        getImage(this.article.id)
            .then(image => {
                this.image = image.image;
            })
            .catch(() => {
                this.image = null;
            });
    }
};
</script>

<style scoped>
@import '../../../styles/item.css';
</style>
