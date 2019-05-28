<template>
    <div class="b-dashboard-divisions">
        <div class="b-divisions-graph mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">Répartition des achats</h2>
            </div>
            <div class="mdl-card__supporting-text">
                <b-donutchart
                    :chartData="purchasesData"
                    :unit="unit"
                    v-if="purchasesData.labels.length > 0"
                ></b-donutchart>
                <span v-else>Aucun achat n'a été effectué sur cette période.</span>
            </div>
        </div>

        <div class="b-divisions-graph mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title">
                <h2 class="mdl-card__title-text">Répartition des rechargements</h2>
            </div>
            <div class="mdl-card__supporting-text">
                <b-donutchart
                    :chartData="reloadsData"
                    :unit="unit"
                    v-if="reloadsData.labels.length > 0"
                ></b-donutchart>
                <span v-else>Aucun rechargement n'a été effectué sur cette période.</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import DonutChart from './DonutChart';
import generateDonutData from './generateDonutData';

export default {
    components: {
        'b-donutchart': DonutChart
    },

    props: {
        start: Date,
        end: Date,
        realtime: Boolean,
        unit: String
    },

    data() {
        return {
            nextUpdateRef: 0
        };
    },

    computed: {
        ...mapState({
            purchasesDivision: state => state.stats.purchasesDivision,
            reloadsDivision: state => state.stats.reloadsDivision
        }),

        purchasesData() {
            return generateDonutData(this.purchasesDivision, this.unit);
        },

        reloadsData() {
            return generateDonutData(this.reloadsDivision, this.unit);
        }
    },

    methods: {
        ...mapActions(['fetchPointsDivision']),

        updateData() {
            clearTimeout(this.nextUpdateRef);

            const props = {
                dateIn: this.start,
                dateOut: this.realtime ? new Date() : this.end
            };

            return this.fetchPointsDivision(props).then(() => {
                this.nextUpdateRef = setTimeout(this.updateData, 10000);
            });
        }
    },

    beforeDestroy() {
        clearTimeout(this.nextUpdateRef);
    },

    mounted() {
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
.b-dashboard-divisions {
    width: calc(100% + 20px);
    display: flex;
    flex-wrap: wrap;
    margin: -10px;
    margin-bottom: 10px;

    & > .b-divisions-graph {
        z-index: 0;
        margin: 10px;
        width: 400px;
        height: auto;

        & > div.mdl-card__supporting-text {
            width: 300px;
            margin: auto;
        }
    }
}
</style>
