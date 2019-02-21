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
            Rechargements <span class="small">(total: {{ totalReload | price(true) }})</span>
        </h4>
        <b-table
            :headers="[
                { title: 'Moyen de paiement', field: 'type' },
                { title: 'Total', field: 'credit', type: 'price' }
            ]"
            :data="displayedReloads"
            :paging="25"
        >
        </b-table>

        <h4>
            Remboursements <span class="small">(total: {{ totalRefund | price(true) }})</span>
        </h4>
        <b-table
            :headers="[
                { title: 'Moyen de paiement', field: 'type' },
                { title: 'Total', field: 'amount', type: 'price' }
            ]"
            :data="displayedRefunds"
            :paging="25"
        >
        </b-table>

        <h4>
            Transferts <span class="small">(total: {{ totalTransfer | price(true) }})</span>
        </h4>
        <b-table
            :headers="[
                { title: 'De', field: 'sender.fullname', class: 'b--capitalized' },
                { title: 'À', field: 'reciever.fullname', class: 'b--capitalized' },
                { title: 'Montant', field: 'amount', type: 'price' }
            ]"
            :paging="25"
            :data="displayedTransfers"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import '../../lib/price';

const fieldsPattern = {
    point: null,
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
            transfers: state => state.objects.transfers,
            reloads: state => state.objects.reloads,
            refunds: state => state.objects.refunds,
            meansofpayment: state => state.objects.meansofpayment
        }),

        ...mapGetters(['periodOptions', 'currentPeriodOptions', 'pointOptions', 'event']),

        totalReload() {
            return this.reloads
                .map(reload => reload.isCancellation ? -1 * parseInt(reload.credit, 10) : parseInt(reload.credit, 10))
                .reduce((a, b) => a + b, 0);
        },

        totalRefund() {
            return this.refunds
                .map(refund => parseInt(refund.amount, 10))
                .reduce((a, b) => a + b, 0);
        },

        totalTransfer() {
            return this.transfers
                .map(transfer => parseInt(transfer.amount, 10))
                .reduce((a, b) => a + b, 0);
        },

        pointOptionsAll() {
            const points = Object.assign([], this.pointOptions);
            points.unshift({ name: 'Tous', value: null });

            return points;
        },

        displayedReloads() {
            return this.reloads.map(reload => ({
                ...reload,
                type: reload.isCancellation ? `Annulation ${this.slugToName(reload.type)}` : this.slugToName(reload.type),
                credit: reload.isCancellation ? -1 * reload.credit : reload.credit
            }));
        },

        displayedRefunds() {
            return this.refunds.map(refund => ({
                ...refund,
                type: this.slugToName(refund.type)
            }));
        },

        displayedTransfers() {
            return this.transfers.map(transfer => {
                transfer.sender.fullname = `${transfer.sender.firstname} ${
                    transfer.sender.lastname
                }`;
                transfer.reciever.fullname = `${transfer.reciever.firstname} ${
                    transfer.reciever.lastname
                }`;

                return transfer;
            });
        }
    },

    methods: {
        ...mapActions(['getTreasury', 'notify', 'notifyError']),

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

            this.getTreasury(inputFields)
                .then(() => this.notify({ message: 'Le calcul a été effectué avec succès' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors du calcul de la trésorerie',
                        full: err
                    })
                );
        },

        slugToName(slug) {
            const index = this.meansofpayment.findIndex(mop => mop.slug === slug);

            return index !== -1 ? this.meansofpayment[index].name : slug;
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
