<template>
    <div class="b-clientviewer">
        <div class="b-clientviewer__panel" v-if="splitedPath.length > 5">
            <router-view></router-view>
        </div>
        <div class="b-clientviewer__items">
            <div class="b-clientviewer__articles">
                <router-link
                    :to="addArticleLink"
                    class="b-item"
                    :class="{ 'b-item--selected': addSelected }">
                    <div class="b-item__add">
                        <i class="material-icons">add_circle_outline</i>
                    </div>
                </router-link>
                <b-clientitem
                    v-for="article in tabArticles"
                    :article="article"
                    :key="article.id">
                </b-clientitem>
            </div>
            <div class="b-clientviewer__sidebar">
                <b-confirm @confirm="unlinkCategory()">
                    Enlever la catégorie du guichet
                </b-confirm>
                <div class="b-clientviewer__promotions" v-if="tabPromotions.length > 0">
                    <div>
                        <strong>Formules</strong>
                        <i class="material-icons" id="promotitle">info</i>
                        <mdl-tooltip target="promotitle">Seules les formules dont les items sont en vente dans le guichet apparaissent.</mdl-tooltip>
                    </div>
                    <b-clientpromotion
                        v-for="promotion in tabPromotions"
                        :promotion="promotion"
                        :key="promotion.id">
                    </b-clientpromotion>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import ClientItem from './ClientViewer-Item';
import ClientPromotion from './ClientViewer-Promotion';
import sortOrder from '../../../lib/sortOrder';

export default {
    components: {
        'b-clientitem': ClientItem,
        'b-clientpromotion': ClientPromotion
    },

    methods: {
        ...mapActions(['removeRelation', 'notify', 'notifyError']),

        unlinkCategory() {
            this.removeRelation({
                obj1: {
                    route: 'categories',
                    value: this.focusedCategory
                },
                obj2: {
                    route: 'points',
                    value: this.focusedPoint
                }
            })
                .then(() => {
                    this.notify({ message: 'La catégorie a bien été supprimée du guichet' });
                    this.$router.push(this.addPath);
                })
                .catch(err =>
                    this.notifyError({
                        message: "La catégorie n'a pas pu être supprimée du guichet",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0],
            focusedCategory: state => state.app.focusedElements[1],
            promotions: state => state.objects.promotions,
            fullPath: state => state.route.fullPath
        }),

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

        tabPromotions() {
            const pointArticles = (this.focusedPoint.categories || []).reduce(
                (a, b) => a.concat(b.articles),
                []
            );

            const fullPromotions = this.promotions
                .filter(promotion => {
                    if (!promotion.sets) {
                        return true;
                    }

                    const toReduce = promotion.sets.map(set => {
                        let match = false;

                        set.articles.forEach(article => {
                            if (pointArticles.some(a => a.id === article.id)) {
                                match = true;
                            }
                        });

                        return match;
                    });

                    return toReduce.reduce((a, b) => a && b, toReduce.length > 0);
                })
                .map(promotion => ({
                    ...promotion,
                    prices: (promotion.prices || []).filter(
                        price => price.point_id === this.focusedPoint.id
                    )
                }));

            return [].concat(
                fullPromotions
                    .filter(promotion => promotion.prices.length > 0)
                    .sort((a, b) => sortOrder(a.name, b.name)),
                fullPromotions
                    .filter(promotion => promotion.prices.length === 0)
                    .sort((a, b) => sortOrder(a.name, b.name))
            );
        },

        splitedPath() {
            return this.fullPath.split('/');
        },

        addPath() {
            const wiketPath = this.splitedPath.slice(0, 3).join('/');

            return `${wiketPath}/category/add`;
        },

        categoryPath() {
            return this.splitedPath.slice(0, 5).join('/');
        },

        addArticleLink() {
            return `${this.categoryPath}/article/add`;
        },

        addSelected() {
            return this.fullPath === this.addArticleLink;
        }
    }
};
</script>

<style>
@import '../../../styles/item.css';

.b-clientviewer {
    & > .b-clientviewer__panel {
        border-bottom: 1px solid #e0e0e0;
        margin: 0px -20px 10px -20px;
        padding: 0px 20px 10px 20px;
    }

    & > .b-clientviewer__items {
        display: flex;

        & > .b-clientviewer__articles {
            align-content: flex-start;
            box-sizing: border-box;
            display: flex;
            flex-wrap: wrap;
            overflow-y: auto;
            padding: 10px;
            flex: 1;
        }

        & > .b-clientviewer__sidebar {
            border-left: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            width: 20%;
            margin: -10px -20px -20px 0px;
            padding: 20px 0px 0px 0px;

            & > div:first-child {
                width: 100%;
                text-align: center;

                & > span {
                    font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
                    height: 36px;
                    text-transform: uppercase;
                    color: #f84f93;
                    cursor: pointer;
                    padding: 5px 5px;
                    display: block;
                    height: 100%;
                    width: 100%;
                    font-size: 15px;
                }

                & > span:hover {
                    background-color: #ebebeb;
                }
            }

            & > .b-clientviewer__promotions {
                border-top: 1px solid #e0e0e0;
                margin: 10px 0px 0px -20px;
                padding: 10px 0px 10px 40px;

                & > div:first-child {
                    display: flex;
                    align-items: center;

                    & > i {
                        margin-left: 5px;
                        margin-bottom: 2px;
                    }
                }
            }
        }
    }
}
</style>
