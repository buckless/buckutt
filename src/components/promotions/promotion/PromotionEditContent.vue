<template>
    <div class="b-promotions__contentManager">
        <div>
            <h5>Contenu de la formule:</h5>
            <transition name="fade">
                <div class="b-responsive-table">
                    <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" v-if="displayedPromotion.length > 0">
                        <tbody>
                            <tr v-for="(set, index) in displayedPromotion" :key="index">
                                <td class="mdl-data-table__cell--non-numeric b-table__little">
                                    1 article parmi :
                                    <span class="mdl-chip b-chip--margin b-table-inter"
                                        v-if="displayedPromotion.length > (index + 1)">
                                        <span class="mdl-chip__text">
                                            +
                                        </span>
                                    </span>
                                </td>
                                <td class="mdl-data-table__cell--non-numeric">
                                    <transition-group name="fade">
                                        <span class="mdl-chip mdl-chip--deletable b--spaces" v-for="(article, indexA) in set.articles" :key="`${index}_${indexA}`">
                                            <span class="mdl-chip__text">{{ article.name }}</span>
                                            <b-confirm @confirm="removeSelectedArticleFromStep(article, index)" class="b--inline">
                                                <button class="mdl-chip__action"><i class="material-icons">cancel</i></button>
                                            </b-confirm>
                                        </span>
                                    </transition-group>
                                </td>
                                <td class="mdl-data-table__cell--non-numeric">
                                    <mdl-button v-if="chooseArticle && !newStep && chosenIndex === index" mini-fab colored @click.native="chooseIndex(index)"><i class="material-icons">remove</i></mdl-button>
                                    <mdl-button v-else mini-fab @click.native="chooseIndex(index)"><i class="material-icons">add</i></mdl-button>
                                </td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="mdl-data-table__cell--non-numeric b--center">
                                    <mdl-button v-if="chooseArticle && newStep" raised colored @click.native="createStep()"><i class="material-icons">remove</i></mdl-button>
                                    <mdl-button v-else @click.native="createStep()"><i class="material-icons">add</i></mdl-button>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </transition>
            <transition name="fade">
                <div v-if="displayedPromotion.length == 0">
                    La promotion est vide.<br /><br />
                    <mdl-button raised colored @click.native="createStep()">Créer un nouveau choix</mdl-button>
                </div>
            </transition>
        </div>
        <div v-if="chooseArticle">
            <h5 v-if="newStep">Créer un nouvel ensemble de choix:</h5>
            <h5 v-else>Ajouter un choix à l'ensemble n°{{ chosenIndex + 1 }}:</h5>
            <mdl-textfield floating-label="Nom" v-model="articleName"></mdl-textfield>

            <b-table
                :headers="[{ title: 'Article', field: 'name' }]"
                :data="articles"
                :filter="{ val: this.articleName, field: 'name' }"
                :sort="{ field: 'name', order: 'ASC' }"
                :actions="[
                    { action: 'choose', text: 'Choisir', raised: true, condition: { field: 'id', statement: 'isNotIn', value: alreadyInArticles } },
                ]"
                route="articles"
                :paging="5"
                @choose="processArticle">
            </b-table>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { promotionDisplayer } from './promotionDisplayer';

export default {
    data() {
        return {
            articleName: '',
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
            'notify',
            'notifyError'
        ]),

        addArticleToCurrentPromotion(article) {
            this.addStepToPromotion({
                promotion: this.focusedPromotion,
                articles: [article]
            })
                .then(() =>
                    this.notify({
                        message: "L'article a bien été ajouté à la promotion."
                    })
                )
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de l'ajout à la promotion",
                        full: err
                    })
                );
        },

        addArticleToChosenStep(article) {
            this.addArticleToStep({
                article,
                step: this.displayedPromotion[this.chosenIndex],
                promotion: this.focusedPromotion
            })
                .then(() =>
                    this.notify({
                        message: "L'article a bien été ajouté à la promotion."
                    })
                )
                .catch(err => {
                    let message;
                    switch (err.message) {
                        case 'The article is already in this set':
                            message = "L'article est déjà présent dans cet ensemble.";
                            break;
                        default:
                            message = "Une erreur inconue a eu lieu lors de l'ajout à la promotion";
                    }

                    this.notifyError({ message, full: err });
                });
        },

        removeSelectedArticleFromStep(article, index) {
            this.removeArticleFromStep({
                article,
                step: this.displayedPromotion[index],
                promotion: this.focusedPromotion
            })
                .then(() =>
                    this.notify({
                        message: "L'article a bien été supprimé de la promotion."
                    })
                )
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la suppression de la promotion',
                        full: err
                    })
                );
        },

        createStep() {
            this.chooseArticle = !(this.chooseArticle && this.newStep);
            this.newStep = true;
        },

        chooseIndex(index) {
            this.chooseArticle = !(
                this.chooseArticle &&
                !this.newStep &&
                this.chosenIndex === index
            );
            this.newStep = false;
            this.chosenIndex = index;
        },

        processArticle(article) {
            if (this.newStep) {
                this.addArticleToCurrentPromotion(article);
            } else {
                this.addArticleToChosenStep(article);
            }
        }
    },

    computed: {
        ...mapState({
            articles: state => state.objects.articles,
            focusedPromotion: state => state.app.focusedElements[0]
        }),

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
        }
    }
};
</script>

<style>
.b-promotions__contentManager {
    display: flex;
    flex-wrap: nowrap;

    & > div {
        flex: 1;
        max-width: 750px;
        margin-left: 5px;
        margin-right: 5px;
    }
}

.b-chip--margin {
    margin-left: 5px;
    margin-right: 5px;
}

.b-table__little {
    max-width: 140px;
}

.b-table-inter {
    position: relative;
    top: 30px;
    left: -72px;
}
</style>
