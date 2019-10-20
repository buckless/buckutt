<template>
    <b-container dropShadow @close="back">
        <b-modal title="Gérer les articles achetables" @close="back" class="b-modal-articles">
            <div class="b-articles-list">
                <span v-if="focusedCoupon.couponSet && focusedCoupon.couponSet.articles.length > 0">
                    <span
                        class="b-list-article"
                        v-for="article in focusedCoupon.couponSet.articles"
                        :key="article.id"
                    >
                        <span>{{ article.name }}</span>
                        <b-confirm
                            @confirm="removeArticle(article)"
                            class="b--inline"
                        >
                            <b-button class="b-article-delete">
                                <b-icon name="cancel" />
                            </b-button>
                        </b-confirm>
                    </span>
                </span>
                <span v-else>
                    Ce coupon ne permet d'acheter aucun article pour le moment.
                </span>
            </div>
            <form @submit.prevent="processArticle(chosenArticle)" class="b-articles-addForm">
                <b-autocomplete
                    :suggestions="displayedArticlesOptions"
                    placeholder="Article à ajouter"
                    v-model="chosenArticle"
                ></b-autocomplete>
                <b-button accent raised><b-icon name="add"/></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Retour</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';

export default {
    data: () => ({
        chosenArticle: null
    }),

    methods: {
        ...mapActions(['updateObject', 'notify', 'createSetWithArticles', 'addArticleToSet', 'removeArticleFromSet']),

        back() {
            this.$router.go(-1);
        },

        async processArticle(articleId) {
            const foundArticle = this.articlesOptions.find(article => article.id === articleId);
            const article = {
                id: foundArticle.id,
                name: foundArticle.label
            };

            if (this.focusedCoupon.couponSet) {
                await this.addArticleToSet({ set: this.focusedCoupon.couponSet, article });
            } else {
                await this.createSet(article);
            }

            this.notify("L'article a bien été ajouté au coupon.");
        },

        async createSet(article) {
            const set = await this.createSetWithArticles({ articles: [article] });
            return this.updateObject({ route: 'coupons', value: { id: this.focusedCoupon.id, set_id: set.id } });
        },

        async removeArticle(article) {
            await this.removeArticleFromSet({
                set: this.focusedCoupon.couponSet,
                article
            });

            this.notify("L'article a bien été supprimé du coupon.");
        }
    },

    computed: {
        ...mapGetters(['articlesOptions', 'focusedElements']),

        focusedCoupon() {
            return this.focusedElements[0];
        },

        alreadyInArticles() {
            if (!this.focusedCoupon.couponSet) {
                return [];
            }

            return this.focusedCoupon.couponSet.articles.map(
                article => article.id
            );
        },

        displayedArticlesOptions() {
            return this.articlesOptions.filter(
                article => this.alreadyInArticles.indexOf(article.id) === -1
            );
        }
    }
};
</script>

<style scoped>
.b-modal-articles {
    overflow: visible !important;
}

.b-articles-list {
    margin-bottom: 15px;
    max-width: 320px;
}

.b-list-article {
    border: 1px solid var(--grey-300);
    border-radius: 5px;
    display: inline-block;
    font-size: 14px;
    margin: 5px;

    & > span {
        padding-left: 10px;
    }
}

.b-article-delete {
    padding: 0px 5px !important;
}

.b-articles-addForm {
    display: flex;
    align-items: center;
    margin-top: -2px;

    & > button {
        margin-left: 10px;
    }
}
</style>
