<template>
    <div class="b-history">
        <div class="mdc-card mdc-card-maximizable">
            <section class="mdc-card__primary">
                <h1 class="mdc-card__title mdc-card__title--large">Historique</h1>
            </section>
            <section class="mdc-card__supporting-text">
                <b-table
                    :headers="[
                        { title: 'Date', field: 'date', type: 'date' },
                        { title: 'Type', field: 'type' },
                        { title: 'Localisation', field: 'point' },
                        { title: 'Objet', field: 'object', list: 'articles' },
                        { title: 'Opérateur', field: 'operator', class: 'b--capitalized' },
                        { title: 'Valeur', field: 'amount', type: 'price', class: 'b-table__numeric-cell' }
                    ]"
                    :data="displayedHistory"
                    :paging="10">
                </b-table>
            </section>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    methods: {
        translation(type) {
            const translateTable = {
                refund: 'Remboursement',
                promotion: 'Achat',
                purchase: 'Achat',
                reload: 'Rechargement',
                transfer: 'Virement'
            };

            return translateTable[type];
        }
    },

    computed: {
        ...mapState({
            history: state => state.app.history
        }),

        displayedHistory() {
            if (!this.history) {
                return [];
            }

            return this.history.map(transaction => {
                const displayedTransaction = {
                    id: transaction.id,
                    rawType: transaction.type,
                    date: transaction.date,
                    amount: transaction.amount,
                    point: transaction.point,
                    type: this.translation(transaction.type),
                    operator: `${transaction.seller.firstname} ${transaction.seller.lastname}`
                };

                if (transaction.isCanceled) {
                    displayedTransaction.warning = 'Cette transaction a été annulée.';
                }

                switch (transaction.type) {
                    case 'transfer':
                        displayedTransaction.object = transaction.point;
                        break;
                    case 'reload':
                        displayedTransaction.object = transaction.mop;
                        break;
                    case 'refund':
                        displayedTransaction.object = transaction.mop;
                        break;
                    case 'purchase':
                        displayedTransaction.object = transaction.articles[0];
                        break;
                    case 'promotion':
                        displayedTransaction.object = transaction.promotion;
                        displayedTransaction.articles = transaction.articles;
                        break;
                    default:
                        displayedTransaction.object = 'Autre';
                }

                return displayedTransaction;
            });
        }
    }
};
</script>
