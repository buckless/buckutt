<template>
    <router-link
        :to="toLink"
        class="b-item"
        :class="{ 'b-item--selected': selected }">
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
import { mapState, mapActions } from 'vuex';
import { getImage } from '../../../lib/fetchImages';
import textSize from '../../../lib/textSize';

export default {
    props: {
        article: Object
    },

    data() {
        return {
            image: null
        };
    },

    methods: {
        ...mapActions(['removeRelation', 'notify', 'notifyError']),

        unlinkArticle() {
            this.removeRelation({
                obj1: {
                    route: 'categories',
                    value: this.focusedCategory
                },
                obj2: {
                    route: 'articles',
                    value: this.article
                }
            })
                .then(() => {
                    this.notify({
                        message: "L'article a bien été supprimé de la catégorie"
                    });
                    this.$router.push(this.categoryPath);
                })
                .catch(err =>
                    this.notifyError({
                        message: "L'article n'a pas pu être supprimé de la catégorie",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedCategory: state => state.app.focusedElements[1],
            focusedArticle: state => state.app.focusedElements[2] || {},
            fullPath: state => state.route.fullPath
        }),

        selected() {
            return this.focusedArticle.id === this.article.id;
        },

        gray() {
            return this.article.prices.length === 0;
        },

        categoryPath() {
            const basePath = this.fullPath
                .split('/')
                .slice(0, 5)
                .join('/');

            return basePath;
        },

        toLink() {
            return `${this.categoryPath}/article/${this.article.id}`;
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
