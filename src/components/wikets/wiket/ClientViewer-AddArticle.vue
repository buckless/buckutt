<template>
    <div class="b-addarticle">
        <h5>Ajout d'un article à la catégorie</h5>
        <form @submit.prevent="addArticle(article)">
            <b-inputselect label="Article à ajouter" id="article-select" :options="remainingArticleOptions" v-model="article"></b-inputselect>
            <mdl-button raised colored>Ajouter</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import sortOrder from '../../../lib/sortOrder';

export default {
    data() {
        return {
            article: ''
        };
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0],
            focusedCategory: state => state.app.focusedElements[1]
        }),

        ...mapGetters(['articleOptions']),

        remainingArticleOptions() {
            return this.articleOptions
                .filter(
                    option =>
                        !(this.focusedCategory.articles || []).find(
                            article => article.id === option.value.id
                        )
                )
                .sort((a, b) => sortOrder(a.value.name, b.value.name));
        }
    },

    methods: {
        ...mapActions(['createRelation', 'notify', 'notifyError']),

        addArticle(article) {
            // Search if the article already has prices in the point
            const articleWithPrices = this.focusedPoint.categories
                .reduce((a, b) => a.concat(b.articles), [])
                .find(a => a.id === article.id);

            this.createRelation({
                obj1: {
                    route: 'categories',
                    value: this.focusedCategory
                },
                obj2: {
                    route: 'articles',
                    value: articleWithPrices || article
                }
            })
                .then(() => {
                    this.notify({ message: "L'article a bien été ajouté à la catégorie" });
                    this.article = '';
                })
                .catch(err =>
                    this.notifyError({
                        message: "L'article n'a pas pu être ajouté à la catégorie",
                        full: err
                    })
                );
        }
    }
};
</script>
