<template>
    <div class="b-dashboard">
        <b-global></b-global>

        <div class="b-timebar mdl-card">
            <div class="mdl-card__supporting-text">
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
                    v-if="!realtime"
                    class="b--limitsize"></b-datetime-picker>
                <mdl-textfield floating-label="Fin" disabled v-else value=" Maintenant"></mdl-textfield>
                <mdl-switch v-model="realtime" @input="timefilter.dateOut = new Date()">Temps réel</mdl-switch>
                <mdl-switch v-model="isAmount">Sommes en euros</mdl-switch>
            </div>
        </div>

        <b-purchases :start="timefilter.dateIn" :end="timefilter.dateOut" :unit="unit" :realtime="realtime"></b-purchases>
        <b-division :start="timefilter.dateIn" :end="timefilter.dateOut" :unit="unit" :realtime="realtime"></b-division>
    </div>
</template>

<script>
import DashboardGlobal from './DashboardGlobal';
import DashboardPurchases from './DashboardPurchases';
import DashboardDivision from './DashboardDivision';

export default {
    components: {
        'b-global': DashboardGlobal,
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
            isAmount: false
        };
    },

    computed: {
        unit() {
            return this.isAmount ? 'amount' : 'count';
        }
    }
};
</script>

<style>
.b-dashboard {
    margin-top: 110px;
    padding-left: 30px;
    padding-right: 30px;
}

.b-timebar {
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    width: 100%;
    min-height: 0;
    margin-bottom: 20px;

    & > div {
        display: flex;
        align-items: center;
        width: 100%;

        & > div {
            margin-left: 15px;
            margin-right: 15px;
            width: 250px;
        }

        & > label {
            margin-left: 15px;
            margin-right: 15px;
            width: 250px;
        }
    }
}
</style>
