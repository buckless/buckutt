<template>
    <div class="b-dashboard-purchases">
        <div class="b-purchases-chart mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">Suivi des achats</h2>
            </div>
            <div class="mdl-card__supporting-text">
                <b-purchaseschart :chartData="chartData" :unit="unit"></b-purchaseschart>
            </div>
            <div class="mdl-card__menu">
                <mdl-switch v-model="additive" @input="updateData">Graphe croissant</mdl-switch>
                <button
                    class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                    @click="displayCurves = true"
                    v-if="!displayCurves"
                >
                    <i class="material-icons">settings</i>
                </button>
            </div>
        </div>

        <div class="b-purchases-curves mdl-card mdl-shadow--2dp" v-if="displayCurves">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">Légende</h2>
            </div>
            <div class="mdl-card__supporting-text">
                <div v-for="(curve, index) in curves" :key="index">
                    <span>
                        {{ index + 1 }}.
                        <i class="material-icons" :style="{ color: colorsPattern[index] }">lens</i>
                    </span>
                    <span v-if="curve.article || (!curve.article && !curve.promotion)">
                        <i class="material-icons">free_breakfast</i>
                        <template v-if="curve.article">{{ curve.article.name }}</template>
                        <template v-else
                            >Tous</template
                        >
                    </span>
                    <span v-if="curve.promotion">
                        <i class="material-icons">stars</i>
                        <template>{{ curve.promotion.name }}</template>
                    </span>
                    <span>
                        <i class="material-icons">view_comfy</i>
                        <template v-if="curve.point">{{ curve.point.name }}</template>
                        <template v-else
                            >Tous</template
                        >
                    </span>
                    <span>
                        <i class="material-icons">local_atm</i>
                        <template v-if="curve.fundation">{{ curve.fundation.name }}</template>
                        <template v-else
                            >Toutes</template
                        >
                    </span>
                    <b-confirm @confirm="deleteCurve(index)">
                        <mdl-button icon="delete"></mdl-button>
                    </b-confirm>
                </div>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <form @submit.prevent="createCurve()">
                    <b-inputselect
                        label="Produit"
                        id="product-select"
                        :options="productOptionsAll"
                        v-model="fields.product"
                    ></b-inputselect>
                    <b-inputselect
                        label="Guichet"
                        id="point-select"
                        :options="pointOptionsAll"
                        v-model="fields.point"
                    ></b-inputselect
                    ><br />
                    <b-inputselect
                        label="Fondation"
                        id="fundation-select"
                        :options="fundationOptionsAll"
                        v-model="fields.fundation"
                        v-if="event.useFundations"
                    ></b-inputselect>
                    <mdl-button icon="add" colored></mdl-button>
                </form>
            </div>
            <div class="mdl-card__menu">
                <button
                    class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect"
                    @click="displayCurves = false"
                >
                    <i class="material-icons">close</i>
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import PurchasesChart from './PurchasesChart';
import generateChartData from './generateChartData';

const fieldsPattern = {
    article: null,
    promotion: null,
    point: null,
    fundation: null,
    product: null
};

const colorsPattern = [
    '#1f77b4',
    '#aec7e8',
    '#ff7f0e',
    '#ffbb78',
    '#2ca02c',
    '#98df8a',
    '#d62728',
    '#ff9896',
    '#9467bd',
    '#c5b0d5',
    '#8c564b',
    '#c49c94',
    '#e377c2',
    '#f7b6d2',
    '#7f7f7f',
    '#c7c7c7',
    '#bcbd22',
    '#dbdb8d',
    '#17becf',
    '#9edae5'
];

export default {
    components: {
        'b-purchaseschart': PurchasesChart
    },

    props: {
        start: Date,
        end: Date,
        realtime: Boolean,
        unit: String
    },

    data() {
        return {
            nextUpdateRef: 0,
            fields: Object.assign({}, fieldsPattern),
            displayCurves: true,
            additive: true,
            colorsPattern
        };
    },

    computed: {
        ...mapState({
            curves: state => state.stats.curves,
            curvesData: state => state.stats.curvesData
        }),

        ...mapGetters([
            'articleOptions',
            'promotionOptions',
            'pointOptions',
            'fundationOptions',
            'event'
        ]),

        productOptionsAll() {
            const products = this.promotionOptions
                .map(p => ({ name: p.name, value: { ...p.value, typeField: 'promotion' } }))
                .concat(this.articleOptions);
            products.unshift({ name: 'Tous', value: null });

            return products;
        },

        pointOptionsAll() {
            const points = Object.assign([], this.pointOptions);
            points.unshift({ name: 'Tous', value: null });

            return points;
        },

        fundationOptionsAll() {
            const fundations = Object.assign([], this.fundationOptions);
            fundations.unshift({ name: 'Toutes', value: null });

            return fundations;
        },

        chartData() {
            return generateChartData(this.curvesData, this.unit, this.colorsPattern);
        }
    },

    methods: {
        ...mapActions(['fetchCurvesData', 'addCurve', 'removeCurve']),

        updateData() {
            clearTimeout(this.nextUpdateRef);

            const curves = {
                dateIn: this.start,
                dateOut: this.realtime ? new Date() : this.end,
                additive: this.additive,
                curves: this.curves
            };

            return this.fetchCurvesData(curves).then(() => {
                this.nextUpdateRef = setTimeout(this.updateData, 10000);
            });
        },

        createCurve() {
            if (this.fields.product && this.fields.product.typeField === 'promotion') {
                this.fields.promotion = this.fields.product;
            } else {
                this.fields.article = this.fields.product;
            }

            this.addCurve(this.fields);
            this.updateData();
            this.fields = Object.assign({}, fieldsPattern);
        },

        deleteCurve(curveIndex) {
            this.removeCurve(curveIndex);
            this.updateData();
        }
    },

    beforeDestroy() {
        clearTimeout(this.nextUpdateRef);
    },

    mounted() {
        if (this.curves.length === 0) {
            this.addCurve(Object.assign({}, fieldsPattern));
        }

        this.updateData();
    },

    watch: {
        start() {
            this.updateData();
        },

        end() {
            this.updateData();
        },

        realtime() {
            this.updateData();
        }
    }
};
</script>

<style>
.b-dashboard-purchases {
    width: calc(100% + 20px);
    display: flex;
    flex-wrap: wrap;
    margin: -10px;
    margin-bottom: 10px;

    & > .b-purchases-chart {
        flex: 3;
        margin: 10px;
        min-width: 500px;

        & > div.mdl-card__supporting-text {
            width: 100%;
        }

        & > div.mdl-card__menu {
            display: flex;
            align-items: center;

            & > label {
                width: 190px;
            }
        }
    }

    & > .b-purchases-curves {
        flex: 2;
        margin: 10px;
        min-width: 500px;

        & > div.mdl-card__supporting-text {
            width: 100%;
            overflow-y: auto;
            flex-grow: 1;
            max-height: 330px;

            & > div {
                display: flex;
                margin-bottom: 5px;

                & > i {
                    margin-right: 15px;
                }

                & > span {
                    display: flex;
                    align-items: center;
                    width: 200px;

                    & > i {
                        margin-right: 5px;
                        font-size: 25px;
                    }
                }

                & > span:first-child {
                    width: 50px;

                    & > i {
                        margin-left: 5px;
                    }
                }
            }
        }

        & > div.mdl-card__actions {
            padding: 15px;
            & > form {
                display: flex;
                align-items: center;

                & > div {
                    width: 200px;
                    margin-right: 5px;
                }
            }
        }
    }
}
</style>
