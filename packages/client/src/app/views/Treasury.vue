<template>
    <div class="b-treasury">
        <div>
            <h3>Achats</h3>
            <table class="b-treasury__table" v-if="treasury.purchases.length > 0">
                <thead>
                    <tr>
                        <th class="b-treasury__table__cell--non-numeric">Article</th>
                        <th>Quantité</th>
                        <th>Total TTC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="purchase in treasury.purchases" :key="purchase.name">
                        <td class="b-treasury__table__cell--non-numeric">{{ purchase.name }}</td>
                        <td>{{ purchase.count }}</td>
                        <td><currency :value="purchase.amount" /></td>
                    </tr>
                </tbody>
            </table>
            <p v-else>Aucun achat à afficher.</p>

            <h3>Rechargements</h3>
            <table class="b-treasury__table" v-if="treasury.reloads.length > 0">
                <thead>
                    <tr>
                        <th class="b-treasury__table__cell--non-numeric">Moyen de paiement</th>
                        <th>Quantité</th>
                        <th>Total TTC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="reload in treasury.reloads" :key="reload.name">
                        <td class="b-treasury__table__cell--non-numeric">{{ reload.name }}</td>
                        <td>{{ reload.count }}</td>
                        <td><currency :value="reload.amount" /></td>
                    </tr>
                </tbody>
            </table>
            <p v-else>Aucun rechargement à afficher.</p>

            <h3>Remboursements</h3>
            <table class="b-treasury__table" v-if="treasury.refunds.length > 0">
                <thead>
                    <tr>
                        <th class="b-treasury__table__cell--non-numeric">Moyen de paiement</th>
                        <th>Quantité</th>
                        <th>Total TTC</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="refund in treasury.refunds" :key="refund.name">
                        <td class="b-treasury__table__cell--non-numeric">{{ refund.name }}</td>
                        <td>{{ refund.count }}</td>
                        <td><currency :value="refund.amount" /></td>
                    </tr>
                </tbody>
            </table>
            <p v-else>Aucun remboursement à afficher.</p>

            <h3>Catering</h3>
            <table class="b-treasury__table" v-if="treasury.catering.length > 0">
                <thead>
                    <tr>
                        <th class="b-treasury__table__cell--non-numeric">Article</th>
                        <th>Quantité</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="cat in treasury.catering" :key="cat.name">
                        <td class="b-treasury__table__cell--non-numeric">{{ cat.name }}</td>
                        <td>{{ cat.count }}</td>
                    </tr>
                </tbody>
            </table>
            <p v-else>Aucun ticket à afficher.</p>

            <h3>Options</h3>
            <div class="b-treasury__export" @click="historyExport">Exporter au format JSON</div>
        </div>
    </div>
</template>

<script>
import { saveAs } from 'file-saver';
import { groupBy } from 'lodash/collection';
import { sumBy } from 'lodash/math';
import { mapState } from 'vuex';
import Currency from '@/components/Currency';

export default {
    components: {
        Currency
    },

    data() {
        return {
            history: []
        };
    },

    computed: {
        treasury() {
            const singleRefunds = [];
            const singleReloads = [];
            const singlePurchases = [];
            const singleCatering = [];

            this.history.forEach(entry => {
                entry.basketToSend.forEach(transaction => {
                    if (transaction.itemType === 'reload') {
                        const mop = this.meansOfPayment.find(
                            mop => mop.slug === transaction.type
                        ) || { name: transaction.type };
                        singleReloads.push({
                            name: mop.name,
                            amount: transaction.amount
                        });
                    } else if (transaction.itemType === 'refund') {
                        const mop = this.meansOfPayment.find(
                            mop => mop.slug === transaction.type
                        ) || { name: transaction.type };
                        singleRefunds.push({
                            name: mop.name,
                            amount: transaction.amount
                        });
                    } else if (transaction.itemType === 'catering') {
                        singleCatering.push({
                            name: transaction.name
                        });
                    } else {
                        singlePurchases.push({
                            name: transaction.name,
                            amount: transaction.amount
                        });
                    }
                });
            });

            const groupedReloads = groupBy(singleReloads, 'name');
            const groupedRefunds = groupBy(singleRefunds, 'name');
            const groupedPurchases = groupBy(singlePurchases, 'name');
            const groupedCatering = groupBy(singleCatering, 'name');

            const reloads = Object.keys(groupedReloads).map(group => ({
                name: group,
                amount: sumBy(groupedReloads[group], 'amount'),
                count: groupedReloads[group].length
            }));

            const refunds = Object.keys(groupedRefunds).map(group => ({
                name: group,
                amount: sumBy(groupedRefunds[group], 'amount'),
                count: groupedRefunds[group].length
            }));

            const purchases = Object.keys(groupedPurchases).map(group => ({
                name: group,
                amount: sumBy(groupedPurchases[group], 'amount'),
                count: groupedPurchases[group].length
            }));

            const catering = Object.keys(groupedCatering).map(group => ({
                name: group,
                count: groupedCatering[group].length
            }));

            return {
                reloads,
                refunds,
                purchases,
                catering
            };
        },

        ...mapState({
            meansOfPayment: state => state.reload.meansOfPayment
        })
    },

    methods: {
        historyExport() {
            if (process.env.TARGET === 'cordova') {
                window.plugins.socialsharing.shareWithOptions({
                    message: this.history
                });
                return;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            const dataToSave = new Blob([JSON.stringify(this.history)], {
                type: 'application/json'
            });
            saveAs(dataToSave, `history-${currentTime}.json`);
        }
    },

    async mounted() {
        this.history = await window.database.getFullHistory();
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

        & > .b-treasury__table {
            background-color: #fff;
            border-radius: 3px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
            margin: 15px auto;
            width: calc(100% - 30px);
            text-align: right;
            border-collapse: collapse;
            font-size: 14px;

            & > thead,
            & > tbody {
                & > tr {
                    & > th,
                    & > td {
                        padding: 10px;
                        border-bottom: 1px solid #e0e0e0;
                    }

                    & > th {
                        color: #979797;
                    }

                    & > .b-treasury__table__cell--non-numeric {
                        text-align: left;
                    }
                }
            }
        }

        & > .b-treasury__export {
            background-color: #fff;
            box-shadow: 0 0 2px color-mod($black a(0.25)), 0 2px 3px color-mod($black a(0.25));
            border-radius: 2px;
            cursor: pointer;
            width: 180px;
            height: 30px;
            margin: auto;
            line-height: 30px;
            font-size: 13px;
        }
    }
}
</style>
