<template>
    <div>
        <h5>Recherche</h5>
        <form @submit.prevent="exportPurchases()">
            <div>
                <b-inputselect label="Point" id="point-select" :options="pointOptionsAll" v-model="fields.point"></b-inputselect>
                <b-inputselect label="Fondation" id="fundation-select" :options="fundationOptionsAll" v-model="fields.fundation" v-if="event.useFundations"></b-inputselect>
            </div>
            <div>
                <b-inputselect label="Période" id="period-select" :options="currentPeriodOptions" :fullOptions="periodOptions" v-if="event.usePeriods" @input="fillDates"></b-inputselect>
                <b-datetime-picker
                    v-model="fields.dateIn"
                    locale="fr"
                    header-format="DD MMM"
                    cancel="Annuler"
                    next="Suivant"
                    back="Retour"
                    pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                    error="Le début n'est pas une date"
                    label="Début"
                    class="b--limitsize b--inline"></b-datetime-picker>
                <b-datetime-picker
                    v-model="fields.dateOut"
                    locale="fr"
                    header-format="DD MMM"
                    cancel="Annuler"
                    next="Suivant"
                    back="Retour"
                    pattern="\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}"
                    error="La fin n'est pas une date"
                    label="Fin"
                    class="b--limitsize b--inline"></b-datetime-picker>
            </div>
            <h6>Options</h6>
            <div>
                <strong>Format:</strong><br />
                <mdl-radio checked="checked" val="csv" value="csv">CSV</mdl-radio>
            </div>
            <mdl-button colored raised>Exporter</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { saveAs } from 'file-saver';
import { download } from '../../lib/fetch';
import treasuryQueryString from '../../lib/treasuryQueryString';
import '../../lib/price';

const fieldsPattern = {
    point: null,
    fundation: null,
    dateIn: null,
    dateOut: null
};

export default {
    data() {
        return {
            fields: Object.assign({}, fieldsPattern)
        };
    },

    computed: {
        ...mapGetters([
            'periodOptions',
            'currentPeriodOptions',
            'pointOptions',
            'fundationOptions',
            'event'
        ]),

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
        ...mapActions(['notify', 'notifyError']),

        exportPurchases() {
            const inputFields = JSON.parse(JSON.stringify(this.fields));
            let isFilled = false;

            Object.keys(inputFields).forEach(key => {
                if (inputFields[key]) {
                    isFilled = true;
                }
            });

            if (
                !isFilled ||
                (inputFields.dateIn && !inputFields.dateOut) ||
                (!inputFields.dateIn && inputFields.dateOut)
            ) {
                return this.notifyError({ message: 'Vous devez choisir au moins un filtre' });
            }

            const qString = treasuryQueryString(inputFields);

            download(`services/treasury/csv/purchases?${qString}`)
                .then(result => {
                    const currentTime = Math.floor(Date.now() / 1000);
                    this.notify({ message: 'Le téléchargement du document va commencer...' });
                    saveAs(result, `treasury-purchases-${currentTime}.csv`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la génération des données',
                        full: err
                    })
                );
        },

        fillDates(period) {
            if (period) {
                this.fields.dateIn = new Date(period.start);
                this.fields.dateOut = new Date(period.end);
            }
        }
    }
};
</script>
