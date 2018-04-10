<template>
    <div class="b-dashboard b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar :title="Tableau de bord" :inCard="true"></b-navbar>

            <h4>Suivi des achats</h4>
            <div class="b-timebar">
                <form @submit.prevent="filter()">
                    <div>
                        <b-datetime-picker
                            v-model="timefilter.dateIn"
                            locale="fr"
                            header-format="DD MMM"
                            cancel="Annuler"
                            next="Suivant"
                            back="Retour"
                            pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                            error="Le début n'est pas une date"
                            label="Début"
                            class="b--limitsize"></b-datetime-picker>
                    </div>
                    <div>
                        <b-datetime-picker
                            v-model="timefilter.dateOut"
                            locale="fr"
                            header-format="DD MMM"
                            cancel="Annuler"
                            next="Suivant"
                            back="Retour"
                            pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                            error="La fin n'est pas une date"
                            label="Fin"
                            :disabled="realtime"
                            class="b--limitsize"></b-datetime-picker>
                        <mdl-checkbox v-model="realtime">Maintenant (temps réel)</mdl-checkbox>
                    </div>
                    <div>
                        <mdl-button colored raised>Appliquer</mdl-button>
                    </div>
                </form>
            </div>

            <div class="b-chart" ref="main"></div>

            <div class="b-curves">
                <div class="b-curves__add">
                    <h5>Ajouter une courbe</h5>
                    <form @submit.prevent="createCurve()">
                        <mdl-radio v-model="typeField" val="article">Article</mdl-radio>
                        <mdl-radio v-model="typeField" val="promotion">Formule</mdl-radio>
                        <b-inputselect label="Article" id="article-select" :options="articleOptionsAll" v-model="fields.article" v-show="typeField === 'article'"></b-inputselect>
                        <b-inputselect label="Formule" id="promotion-select" :options="promotionOptionsAll" v-model="fields.promotion" v-show="typeField === 'promotion'"></b-inputselect>
                        <br />
                        <b-inputselect label="Guichet" id="point-select" :options="pointOptionsAll" v-model="fields.point"></b-inputselect><br />
                        <b-inputselect label="Fondation" id="fundation-select" :options="fundationOptionsAll" v-model="fields.fundation" v-if="event.useFundations"></b-inputselect><br />

                        <mdl-button colored raised>Ajouter</mdl-button>
                    </form>
                </div>
                <div class="b-curves__list">
                    <h5>Légende</h5>
                    <div v-for="(curve, index) in curves">
                        <span>
                            {{ index + 1 }}.
                            <i class="material-icons" :style="{ color: colorsPattern[index] }">lens</i>
                        </span>
                        <span v-if="curve.article || (!curve.article && !curve.promotion)">
                            <i class="material-icons">free_breakfast</i>
                            <template v-if="curve.article">{{ curve.article.name }}</template>
                            <template v-else>Tous</template>
                        </span>
                        <span v-if="curve.promotion">
                            <i class="material-icons">stars</i>
                            <template>{{ curve.promotion.name }}</template>
                        </span>
                        <span>
                            <i class="material-icons">view_comfy</i>
                            <template v-if="curve.point">{{ curve.point.name }}</template>
                            <template v-else>Tous</template>
                        </span>
                        <span>
                            <i class="material-icons">local_atm</i>
                            <template v-if="curve.fundation">{{ curve.fundation.name }}</template>
                            <template v-else>Toutes</template>
                        </span>
                        <b-confirm @confirm="deleteCurve(index)">
                            <mdl-button icon="delete"></mdl-button>
                        </b-confirm>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex';
import c3 from 'c3/c3.min';
import generateChartData from './generateChartData';
import '../../lib/moment-round';

const fieldsPattern = {
    article: null,
    promotion: null,
    point: null,
    fundation: null
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
    data() {
        return {
            nextUpdateRef: 0,
            unit: 'count',
            typeField: 'article',
            fields: Object.assign({}, fieldsPattern),
            timefilter: {
                dateIn: moment()
                    .subtract(1, 'hour')
                    .toDate(),
                dateOut: new Date()
            },
            realtime: true,
            activeTimefilter: {},
            colorsPattern
        };
    },

    computed: {
        ...mapState({
            curves: state => state.stats.curves,
            curvesData: state => state.stats.curvesData
        }),

        ...mapGetters(['articleOptions', 'promotionOptions', 'pointOptions', 'fundationOptions', 'event']),

        articleOptionsAll() {
            const articles = Object.assign([], this.articleOptions);
            articles.unshift({ name: 'Tous', value: null });

            return articles;
        },

        promotionOptionsAll() {
            const promotions = Object.assign([], this.promotionOptions);
            promotions.unshift({ name: 'Toutes', value: null });

            return promotions;
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
        }
    },

    methods: {
        ...mapActions(['fetchCurvesData', 'addCurve', 'removeCurve']),

        updateData() {
            if (this.realtime) {
                this.timefilter.dateOut = new Date();
                this.activeTimefilter.dateOut = new Date();
            }

            clearTimeout(this.nextUpdateRef);

            const curves = {
                ...this.activeTimefilter,
                curves: this.curves
            };

            return this.fetchCurvesData(curves).then(() => {
                if (this.chart) {
                    this.chart.load(generateChartData(this.curvesData, this.unit, colorsPattern));
                }

                this.nextUpdateRef = setTimeout(this.updateData, 10000);
            });
        },

        filter() {
            this.activeTimefilter = Object.assign({}, this.timefilter);
            this.updateData();
        },

        createCurve() {
            if (this.typeField === 'article') {
                this.fields.promotion = null;
            } else {
                this.fields.article = null;
            }

            this.addCurve(Object.assign({ event: this.event }, this.fields));
            this.updateData();
            this.fields = Object.assign({}, fieldsPattern);
        },

        deleteCurve(curveIndex) {
            const lastCurve = this.curves.length;
            this.removeCurve(curveIndex);

            this.chart.unload({
                ids: [`Courbe ${lastCurve}`],
                done: this.updateData
            });
        }
    },

    mounted() {
        this.activeTimefilter = Object.assign({}, this.timefilter);

        if (this.curves.length === 0) {
            this.addCurve(Object.assign({ event: this.event }, this.fields));
        }

        this.updateData().then(() => {
            this.chart = c3.generate({
                bindto: this.$refs.main,
                data: generateChartData(this.curvesData, this.unit, colorsPattern),
                grid: {
                    x: {
                        show: true
                    },
                    y: {
                        show: true
                    }
                },
                axis: {
                    x: {
                        type: 'timeseries',
                        tick: {
                            format: '%d/%m %H:%M'
                        }
                    }
                },
                legend: {
                    show: false
                }
            });
        });
    },

    beforeDestroy() {
        clearTimeout(this.nextUpdateRef);
    }
};
</script>

<style>
.b-timebar {
    margin-bottom: 5px;

    & > form {
        display: flex;

        & > div {
            margin-right: 10px;

            & > button {
                margin-top: 12px;
            }

            & > label {
                margin-top: -20px;
            }
        }
    }
}

.b-curves {
    display: flex;

    & > .b-curves__add {
        width: 25%;

        & > form {
            & > label {
                margin-right: 20px;
            }
        }
    }

    & > .b-curves__list {
        & > div {
            display: flex;
            margin-left: 10px;
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
}
</style>
