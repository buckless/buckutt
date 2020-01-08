<template>
    <b-container dropShadow @close="back">
        <b-modal title="Ajouter un article" @close="back" class="b-article-create">
            <form @submit.prevent="create">
                <b-autocomplete
                    label="Nom de l'article"
                    v-model="article"
                    :suggestions="remainingArticlesOptions"
                    class="b-article-field"
                ></b-autocomplete>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="create">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            article: ''
        };
    },

    methods: {
        ...mapActions(['createRelation']),

        back() {
            this.$router.go(-1);
        },

        create() {
            const articleWithPrices = this.focusedPoint.categories
                .reduce((a, b) => a.concat(b.articles), [])
                .find(a => a.id === this.article);
            const article = this.articles.find(a => a.id === this.article);

            return this.linkArticle(articleWithPrices || article);
        },

        async linkArticle(article) {
            await this.createRelation({
                obj1: {
                    route: 'categories',
                    value: this.focusedCategory
                },
                obj2: {
                    route: 'articles',
                    value: article
                }
            });

            this.back();
        }
    },

    computed: {
        ...mapGetters(['getApiObjects', 'articlesOptions', 'focusedElements']),

        articles() {
            return this.getApiObjects('articles');
        },

        focusedPoint() {
            return this.focusedElements[0];
        },

        focusedCategory() {
            return this.focusedElements[1];
        },

        remainingArticlesOptions() {
            return this.articlesOptions.filter(
                option =>
                    !(this.focusedCategory.articles || []).some(article => article.id === option.id)
            );
        }
    }
};
</script>

<style scoped>
.b-article-create {
    overflow: visible !important;
}

form {
    & > .b-article-field {
        margin-top: 15px;
        display: block;
        width: 300px;
    }
}
</style>
