<template>
    <div class="b-transactions">
        <h5>Liste des transactions</h5>
        <b-table
            :headers="[
                { title: 'Date', field: 'date', type: 'date' },
                { title: 'Type', field: 'type' },
                { title: 'Localisation', field: 'point' },
                { title: 'Objet', field: 'object', list: 'articles' },
                { title: 'Avec', field: 'operator', class: 'b--capitalized' },
                { title: 'Valeur', field: 'amount', type: 'price' }
            ]"
            :data="displayedHistory"
            :actions="[
                {
                    action: 'cancel',
                    text: 'Annuler',
                    type: 'confirm',
                    condition: { field: 'rawType', statement: 'isIn', value: ['purchase', 'reload', 'promotion'] }
                }
            ]"
            :paging="10"
            @cancel="cancel"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0],
            history: state => state.objects.history,
            meansofpayment: state => state.objects.meansofpayment
        }),
        displayedHistory() {
            if (!this.history) {
                return [];
            }

            return this.history.map(transaction => {
                const rawType = transaction.type.replace('-cancellation', '');

                const displayedTransaction = {
                    id: transaction.id,
                    rawType,
                    date: transaction.date,
                    amount: transaction.amount,
                    point: transaction.point,
                    type: this.translation(transaction.type),
                    operator: `Opérateur ${transaction.seller.firstname} ${
                        transaction.seller.lastname
                    }`
                };

                switch (rawType) {
                    case 'transfer':
                        displayedTransaction.object = transaction.point;
                        break;
                    case 'reload':
                        displayedTransaction.object = this.translateMop(transaction.mop);
                        break;
                    case 'refund':
                        displayedTransaction.object = this.translateMop(transaction.mop);
                        break;
                    case 'purchase':
                        displayedTransaction.object = transaction.articles[0];
                        break;
                    case 'promotion':
                        displayedTransaction.object = transaction.promotion;
                        displayedTransaction.articles = transaction.articles;
                        break;
                    default:
                        break;
                }

                return displayedTransaction;
            });
        }
    },

    methods: {
        ...mapActions(['loadUserHistory', 'cancelTransaction', 'notify', 'notifyError']),
        translation(type) {
            const splittedType = type.split('-');
            const translateTable = {
                refund: 'Remboursement',
                promotion: 'Achat',
                purchase: 'Achat',
                reload: 'Rechargement',
                transfer: 'Virement'
            };

            return splittedType[1] ? `Annulation ${translateTable[splittedType[0]]}` : translateTable[splittedType[0]];
        },
        translateMop(mop) {
            const translation = this.meansofpayment.find(m => m.slug === mop);

            return translation ? translation.name : mop;
        },
        cancel(transaction) {
            this.cancelTransaction({
                transaction,
                user: this.focusedUser
            })
                .then(() => {
                    this.notify({ message: 'La transaction a bien été annulée' });
                    this.loadUserHistory(this.focusedUser);
                })
                .catch(err => {
                    let message;
                    switch (err.message) {
                        case 'Forbidden':
                            message = "L'utilisateur n'a pas assez de crédit";
                            break;
                        default:
                            message = 'Erreur inconnue';
                    }

                    this.notifyError({ message, full: err });
                });
        }
    },

    mounted() {
        this.loadUserHistory(this.focusedUser);
    }
};
</script>
