<template>
    <div class="b-treasury">
        <div>
            <h3>Achats</h3>
            <table class="b-treasury-table" v-if="treasury.purchases.length > 0">
              <thead>
                <tr>
                  <th class="b-treasury-table__cell--non-numeric">Article</th>
                  <th>Quantité</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="purchase in treasury.purchases">
                  <td class="b-treasury-table__cell--non-numeric">{{ purchase.name }}</td>
                  <td>{{ purchase.count }}</td>
                  <td><currency :value="purchase.amount" /></td>
                </tr>
              </tbody>
            </table>
            <p v-else>Aucun achat à afficher.</p>

            <h3>Rechargements</h3>
            <table class="b-treasury-table" v-if="treasury.reloads.length > 0">
              <thead>
                <tr>
                  <th class="b-treasury-table__cell--non-numeric">Moyen de paiement</th>
                  <th>Quantité</th>
                  <th>Total TTC</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reload in treasury.reloads">
                  <td class="b-treasury-table__cell--non-numeric">{{ reload.name }}</td>
                  <td>{{ reload.count }}</td>
                  <td><currency :value="reload.amount" /></td>
                </tr>
              </tbody>
            </table>
            <p v-else>Aucun rechargement à afficher.</p>
        </div>
    </div>
</template>

<script>
import groupBy from 'lodash.groupby';
import sumBy from 'lodash.sumby';
import { mapState } from 'vuex';
import Currency from './Currency';

export default {
    components: {
        Currency
    },

    computed: {
        treasury() {
            const singleReloads = [];
            const singlePurchases = [];

            this.history.forEach(entry => {
                entry.basketToSend.forEach(transaction => {
                    if (transaction.credit) {
                        singleReloads.push({
                            name: this.meansOfPayment.find(mop => mop.slug === transaction.type).name,
                            amount: transaction.credit
                        });
                    } else {
                        const name = transaction.promotion_id
                            ? this.items.promotions.find(p => p.id === transaction.promotion_id).name
                            : this.items.items.find(i => i.id === transaction.articles[0].id).name;

                        singlePurchases.push({
                            name,
                            amount: transaction.cost
                        });
                    }
                });
            });

            const groupedReloads = groupBy(singleReloads, 'name');
            const groupedPurchases = groupBy(singlePurchases, 'name');
            const reloads = [];
            const purchases = [];

            Object.keys(groupedReloads).forEach(group => {
                reloads.push({ name: group, amount: sumBy(groupedReloads[group], 'amount'), count: groupedReloads[group].length });
            });

            Object.keys(groupedPurchases).forEach(group => {
                purchases.push({ name: group, amount: sumBy(groupedPurchases[group], 'amount'), count: groupedPurchases[group].length });
            });

            return {
                reloads,
                purchases
            };
        },

        ...mapState({
            history: state => state.history.history,
            items: state => state.items,
            meansOfPayment: state => state.reload.meansOfPayment
        })
    }
};
</script>

<style>
@import '../main.css';

.b-treasury {
    background-color: #f3f3f3;
    width: 100vw;

    & > div {
        max-width: 600px;
        margin: auto;
        text-align: center;

        & > p {
            font-size: 15px;
        }

        & > .b-treasury-table {
            background-color: #fff;
            border-radius: 3px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
            margin: 15px auto;
            width: calc(100% - 30px);
            text-align: right;
            border-collapse: collapse;
            font-size: 14px;

            & > thead, & > tbody {
                & > tr {
                    & > th, & > td {
                        padding: 10px;
                        border-bottom: 1px solid #e0e0e0;
                    }

                    & > th {
                        color: #979797;
                    }

                    & > .b-treasury-table__cell--non-numeric {
                        text-align: left;
                    }
                }
            }
        }
    }
}
</style>
