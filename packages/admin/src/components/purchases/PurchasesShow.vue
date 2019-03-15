<template>
    <div>
        <h5>Recherche</h5>
        <form @submit.prevent="filter()">
            <div>
                <b-inputselect
                    label="Point"
                    id="point-select"
                    :options="pointOptionsAll"
                    v-model="fields.point"
                ></b-inputselect>
                <b-inputselect
                    label="Fondation"
                    id="fundation-select"
                    :options="fundationOptionsAll"
                    v-model="fields.fundation"
                    v-if="event.useFundations"
                ></b-inputselect>
            </div>
            <div>
                <b-inputselect
                    label="Période"
                    id="period-select"
                    :options="currentPeriodOptions"
                    :fullOptions="periodOptions"
                    v-if="event.usePeriods"
                    @input="fillDates"
                ></b-inputselect>
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
                    class="b--limitsize b--inline"
                ></b-datetime-picker>
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
                    class="b--limitsize b--inline"
                ></b-datetime-picker>
            </div>
            <mdl-button colored raised>Rechercher</mdl-button>
        </form>

        <h4>
            Ventes <span class="small">(total: {{ totalSell | price(true) }})</span>
        </h4>

        <b-table
            :headers="[
                { title: 'Quantité', field: 'count' },
                { title: 'Article', field: 'name' },
                { title: 'Prix unitaire TTC', field: 'price', type: 'price' },
                { title: 'Total TTC', field: 'totalTI', type: 'price' }
            ]"
            :paging="25"
            :data="displayedPurchases"
        >
        </b-table>

        <h4>Catering</h4>

        <b-table
            :headers="[{ title: 'Quantité', field: 'count' }, { title: 'Article', field: 'name' }]"
            :paging="10"
            :data="withdrawals"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
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
        ...mapState({
            purchases: state => state.objects.purchases,
            withdrawals: state => state.objects.withdrawals
        }),

        ...mapGetters([
            'periodOptions',
            'currentPeriodOptions',
            'pointOptions',
            'fundationOptions',
            'event'
        ]),

        totalSell() {
            return this.purchases
                .map(purchase =>
                    purchase.isCancellation
                        ? -1 * parseInt(purchase.totalTI, 10)
                        : parseInt(purchase.totalTI, 10)
                )
                .reduce((a, b) => a + b, 0);
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

        displayedPurchases() {
            return this.purchases.map(purchase => ({
                ...purchase,
                price: purchase.isCancellation ? -1 * purchase.price : purchase.price,
                totalTI: purchase.isCancellation ? -1 * purchase.totalTI : purchase.totalTI,
                name: purchase.isCancellation ? `Annulation ${purchase.name}` : purchase.name
            }));
        }
    },

    methods: {
        ...mapActions(['getPurchases', 'notify', 'notifyError']),

        filter() {
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
                return this.notifyError({
                    message: 'Vous devez choisir au moins un filtre'
                });
            }

            this.getPurchases(inputFields)
                .then(() => this.notify({ message: 'Le calcul a été effectué avec succès' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors du calcul des achats',
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
