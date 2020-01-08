<template>
    <div class="b-dashboard-purchases">
        <b-card class="b-purchases-chart">
            <div class="b-purchases-title">
                <h5>Suivi des achats</h5>
                <div class="b--flexspacer"></div>
                <div class="b-purchases-title-options">
                    <b-toggle v-model="additive" @change="updateData">Graphe croissant</b-toggle>
                    <b-button @click="displayCurves = true" v-if="!displayCurves">
                        <b-icon name="settings" />
                    </b-button>
                </div>
            </div>
            <div class="b-purchases-chart-canvas">
                <b-purchaseschart
                    :chartData="chartData"
                    :unit="unit"
                    :additive="additive"
                ></b-purchaseschart>
            </div>
        </b-card>

        <b-card class="b-purchases-curves" v-if="displayCurves">
            <div class="b-purchases-title">
                <h5>Légende</h5>
                <div class="b--flexspacer"></div>
                <div class="b-purchases-title-options">
                    <b-button @click="displayCurves = false">
                        <b-icon name="close" />
                    </b-button>
                </div>
            </div>
            <div class="b-purchases-curves-legend">
                <div v-for="(curve, index) in curves" :key="index">
                    <span>
                        {{ index + 1 }}.
                        <b-icon name="lens" :style="{ color: colorsPattern[index] }" />
                    </span>
                    <span v-if="curve.article || (!curve.article && !curve.promotion)">
                        <b-icon name="free_breakfast" />
                        <template v-if="curve.article">{{ curve.article.label }}</template>
                        <template v-else
                            >Tous</template
                        >
                    </span>
                    <span v-if="curve.promotion">
                        <b-icon name="stars" />
                        <template>{{ curve.promotion.label }}</template>
                    </span>
                    <span>
                        <b-icon name="view_comfy" />
                        <template v-if="curve.point">{{ curve.point.label }}</template>
                        <template v-else
                            >Tous</template
                        >
                    </span>
                    <span v-if="event.useFundations">
                        <b-icon name="local_atm" />
                        <template v-if="curve.fundation">{{ curve.fundation.label }}</template>
                        <template v-else
                            >Toutes</template
                        >
                    </span>
                    <b-confirm @confirm="deleteCurve(index)">
                        <b-button><b-icon name="delete"/></b-button>
                    </b-confirm>
                </div>
            </div>
            <div class="b-purchases-curves-actions">
                <form @submit.prevent="createCurve()">
                    <b-autocomplete
                        label="Produit"
                        v-model="fields.product"
                        :sections="[
                            { id: 'common', label: 'Commun' },
                            { id: 'articles', label: 'Articles' },
                            { id: 'promotions', label: 'Formules' }
                        ]"
                        :suggestions="[
                            { label: 'Tous', id: 'all', section: 'common' },
                            ...this.articlesOptions.map(option => ({
                                ...option,
                                section: 'articles'
                            })),
                            ...this.promotionsOptions.map(option => ({
                                ...option,
                                section: 'promotions'
                            }))
                        ]"
                    ></b-autocomplete>
                    <b-autocomplete
                        label="Point"
                        v-model="fields.point"
                        :suggestions="[{ label: 'Tous', id: 'all' }, ...this.pointsOptions]"
                    ></b-autocomplete>
                    <b-autocomplete
                        label="Fondation"
                        v-model="fields.fundation"
                        :suggestions="[{ label: 'Toutes', id: 'all' }, ...this.fundationsOptions]"
                        v-if="event.useFundations"
                    ></b-autocomplete>
                    <b-button><b-icon name="add"/></b-button>
                </form>
            </div>
        </b-card>
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
            'articlesOptions',
            'promotionsOptions',
            'pointsOptions',
            'fundationsOptions',
            'event'
        ]),

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
            const article = this.articlesOptions.find(
                article => article.id === this.fields.product
            );
            const promotion = this.promotionsOptions.find(
                promotion => promotion.id === this.fields.promotion
            );
            const point = this.pointsOptions.find(point => point.id === this.fields.point);
            const fundation = this.fundationsOptions.find(
                fundation => fundation.id === this.fields.fundation
            );

            this.addCurve({ article, promotion, point, fundation });
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

        & > .b-purchases-chart-canvas {
            position: relative;
        }
    }

    & > .b-purchases-curves {
        flex: 2;
        padding: 10px;
        min-width: 500px;
        overflow: visible !important;

        & > .b-purchases-curves-legend {
            overflow-y: auto;
            height: 330px;

            & > div {
                display: flex;
                margin-bottom: 5px;

                & > span {
                    display: flex;
                    align-items: center;
                    width: 200px;
                    margin-right: 5px;

                    & > span.icon {
                        margin-right: 5px;
                    }
                }

                & > span:first-child {
                    width: 50px;

                    & > span.icon {
                        margin-left: 5px;
                    }
                }
            }
        }

        & > .b-purchases-curves-actions {
            border-top: 1px solid #f2f1f3;
            width: calc(100% + 30px);
            margin: 0 -15px;
            padding: 10px 15px;

            & > form {
                display: flex;
                align-items: flex-end;

                & > .autocomplete {
                    flex: 1;
                    margin-right: 5px;
                }

                & > button {
                    margin-bottom: 3px;
                }
            }
        }
    }
}

.b-purchases-title {
    display: flex;

    & > h5 {
        margin-top: 5px;
    }

    & > .b-purchases-title-options {
        display: flex;
        align-items: center;
        margin-top: -7px;

        & > label {
            margin-right: 10px;
        }
    }
}
</style>
