<template>
    <b-card class="b-promotions">
        <div v-if="displayedPromotion.length === 0" class="b--center">
            La promotion ne comporte aucun article.
        </div>
        <div class="b-promotions-steps" v-else>
            <div v-for="(set, index) in displayedPromotion" :key="index" class="b-promotions-step">
                <span class="b-promotions-step-set"> Ensemble n°{{ index + 1 }} </span>
                <div class="b-promotions-step-content">
                    <span
                        class="b-promotions-step-content-article"
                        v-for="(article, indexA) in set.articles"
                        :key="`${index}_${indexA}`"
                    >
                        <span>{{ article.name }}</span>
                        <b-confirm
                            @confirm="removeSelectedArticleFromStep(article, index)"
                            class="b--inline"
                        >
                            <b-button class="b-promotions-article-delete">
                                <b-icon name="cancel" />
                            </b-button>
                        </b-confirm>
                    </span>
                </div>
                <div class="b-promotions-step-form">
                    <form
                        class="b-promotions-addForm"
                        v-if="chooseArticle && !newStep && chosenIndex === index"
                        @submit.prevent="processArticle(chosenArticle)"
                    >
                        <b-autocomplete
                            :suggestions="displayedArticlesOptions"
                            placeholder="Article à ajouter"
                            v-model="chosenArticle"
                        ></b-autocomplete>
                        <b-button accent raised><b-icon name="add"/></b-button>
                    </form>
                    <b-button raised v-else @click.native="chooseIndex(index)"
                        ><b-icon name="add"></b-icon
                    ></b-button>
                </div>
            </div>
        </div>
        <div class="b-promotions-addstep">
            <form
                class="b-promotions-addForm"
                v-if="chooseArticle && newStep"
                @submit.prevent="processArticle(chosenArticle)"
            >
                <b-autocomplete
                    :suggestions="displayedArticlesOptions"
                    placeholder="Article à ajouter"
                    v-model="chosenArticle"
                ></b-autocomplete>
                <b-button accent raised><b-icon name="add"/></b-button>
            </form>
            <b-button raised v-else @click.native="createStep()">Créer un nouvel ensemble</b-button>
        </div>
    </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { promotionDisplayer } from './promotionDisplayer';

export default {
    data() {
        return {
            articleName: '',
            chosenArticle: null,
            chosenIndex: 0,
            chooseArticle: false,
            newStep: false
        };
    },

    methods: {
        ...mapActions([
            'addStepToPromotion',
            'addArticleToStep',
            'removeArticleFromStep',
            'notify'
        ]),

        async addArticleToCurrentPromotion(article) {
            try {
                await this.addStepToPromotion({
                    promotion: this.focusedPromotion,
                    articles: [article]
                });

                this.notify("L'article a bien été ajouté à la promotion.");
            } catch {
                this.notify("Une erreur a eu lieu lors de l'ajout à la promotion");
            }
        },

        async addArticleToChosenStep(article) {
            try {
                await this.addArticleToStep({
                    article,
                    step: this.displayedPromotion[this.chosenIndex],
                    promotion: this.focusedPromotion
                });

                this.notify("L'article a bien été ajouté à la promotion.");
            } catch (err) {
                if (err.message === 'The article is already in this set') {
                    return this.notify("L'article est déjà présent dans cet ensemble.");
                }

                this.notify("Une erreur inconue a eu lieu lors de l'ajout à la promotion");
            }
        },

        async removeSelectedArticleFromStep(article, index) {
            try {
                await this.removeArticleFromStep({
                    article,
                    step: this.displayedPromotion[index],
                    promotion: this.focusedPromotion
                });

                this.notify("L'article a bien été supprimé de la promotion.");
            } catch {
                this.notify('Une erreur a eu lieu lors de la suppression de la promotion');
            }
        },

        createStep() {
            this.chooseArticle = true;
            this.newStep = true;
        },

        chooseIndex(index) {
            this.chooseArticle = true;
            this.newStep = false;
            this.chosenIndex = index;
        },

        processArticle(articleId) {
            const foundArticle = this.articlesOptions.find(article => article.id === articleId);
            const article = {
                id: foundArticle.id,
                name: foundArticle.label
            };

            if (this.newStep) {
                this.addArticleToCurrentPromotion(article);
            } else {
                this.addArticleToChosenStep(article);
            }
        }
    },

    computed: {
        ...mapGetters(['articlesOptions', 'focusedElements']),

        focusedPromotion() {
            return this.focusedElements[0];
        },

        displayedPromotion() {
            return promotionDisplayer(this.focusedPromotion);
        },

        alreadyInArticles() {
            if (this.displayedPromotion.length > 0) {
                if (!this.newStep) {
                    return this.displayedPromotion[this.chosenIndex].articles.map(
                        article => article.id
                    );
                }
            }

            return [];
        },

        displayedArticlesOptions() {
            return this.articlesOptions.filter(
                article => this.alreadyInArticles.indexOf(article.id) === -1
            );
        }
    }
};
</script>

<style>
.b-promotions {
    overflow: visible !important;

    & > .b-promotions-addstep {
        padding-top: 20px;
        display: flex;
        justify-content: center;
    }

    & > .b-promotions-steps {
        & > .b-promotions-step {
            display: flex;
            border: 1px solid var(--grey-300);
            padding: 15px;
            margin: -1px 0;

            & > .b-promotions-step-set {
                width: 130px;
                align-self: center;
            }

            & > .b-promotions-step-content {
                flex: 1;
                align-self: center;

                & > .b-promotions-step-content-article {
                    border: 1px solid var(--grey-300);
                    border-radius: 5px;
                    display: inline-block;
                    font-size: 14px;
                    margin: 5px;

                    & > span {
                        padding-left: 10px;
                    }
                }
            }
        }
    }
}

.b-promotions-article-delete {
    padding: 0px 5px !important;
}

.b-promotions-addForm {
    display: flex;
    align-items: center;
    margin-top: -2px;

    & > button {
        margin-left: 10px;
    }
}
</style>
