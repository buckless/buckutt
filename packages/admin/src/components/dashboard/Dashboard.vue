<template>
    <div class="b-dashboard">
        <div class="b-timebar">
            <b-datetimeinput v-model="timefilter.dateIn" label="Début"></b-datetimeinput>
            <b-icon name="arrow_right_alt" :size="34" class="b-timebar-dates-arrow"></b-icon>
            <b-datetimeinput
                v-model="timefilter.dateOut"
                label="Fin"
                v-show="!realtime"
            ></b-datetimeinput>
            <b-datetimeinput
                placeholder="Maintenant"
                disabled
                label="Fin"
                v-show="realtime"
            ></b-datetimeinput>
            <div class="b-timebar-options">
                <b-toggle v-model="realtime" @change="timefilter.dateOut = new Date()"
                    >Temps réel</b-toggle
                >
                <b-toggle v-model="isAmount">Somme en euros</b-toggle>
            </div>
        </div>

        <div class="b-graphs">
            <b-purchases
                :start="timefilter.dateIn"
                :end="timefilter.dateOut"
                :unit="unit"
                :realtime="realtime"
            ></b-purchases>
            <b-division
                :start="timefilter.dateIn"
                :end="timefilter.dateOut"
                :unit="unit"
                :realtime="realtime"
            ></b-division>
        </div>
    </div>
</template>

<script>
import DashboardPurchases from './DashboardPurchases';
import DashboardDivision from './DashboardDivision';

export default {
    components: {
        'b-purchases': DashboardPurchases,
        'b-division': DashboardDivision
    },

    data() {
        return {
            timefilter: {
                dateIn: moment()
                    .subtract(1, 'hour')
                    .toDate(),
                dateOut: new Date()
            },
            realtime: true,
            isAmount: true
        };
    },

    computed: {
        unit() {
            return this.isAmount ? 'amount' : 'count';
        }
    }
};
</script>

<style scoped>
.b-graphs {
    margin: 30px;
}
</style>
