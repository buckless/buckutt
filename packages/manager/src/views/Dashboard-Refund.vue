<template>
    <div class="refund">
        <Card>
            <h3>Remboursement de solde</h3>

            <p>
                Si l'organisateur a activé cette option, vous pouvez être remboursé de votre solde
                restant.

                <br />
                <br />

                <template v-if="refundData.allowed">
                    Vous pouvez demander le remboursement de
                    <strong>{{ (refundData.refundable / 100) | currency }}</strong>.<br />
                    <template v-if="refundCost > 0">
                        Des frais bancaires d'une valeur de <strong>{{ (refundCost / 100) | currency }}</strong> seront retenus, <strong>{{ ((refundData.refundable - refundCost) / 100) | currency }}</strong> seront virés sur votre compte.
                    </template>
                    <br />
                    <template v-if="refundData.cardRegistered">
                        Le remboursement sera effectué par défaut <strong>sur la dernière carte que vous avez utiliser pour créditer votre compte</strong>.
                        <br />
                        <br />
                        Pour enregistrer une autre carte, cliquez <strong @click="registerCard">ici</strong>.
                    </template>
                    <i>L'enregistrement d'une carte bleue à rembourser se fait par une demande d'autorisation de débit de 1 euro, qui ne sera pas débitée de votre compte bancaire</i>.
                </template>
                <template v-else>
                    <div v-for="(error, i) in whyCantRefund" :key="i">
                        {{ error }}
                    </div>
                </template>
            </p>

            <form class="actions" @submit.prevent="refund">
                <Button to="/dashboard/menu">Retour</Button>
                <Button v-if="refundData.allowed && refundData.cardRegistered" :disabled="working" raised>Remboursement</Button>
                <Button v-if="refundData.allowed && !refundData.cardRegistered" :disabled="working" raised @click.prevent="registerCard">Enregistrer une carte</Button>
            </form>
        </Card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardRefund',

    components: {
        Card,
        Button
    },

    computed: {
        ...mapGetters({
            refundData: 'refund/refund',
            whyCantRefund: 'refund/whyCant',
            working: 'working/working',
            costs: 'user/costs'
        }),

        refundCost() {
            return (this.costs.variableCostsRefund / 100) * this.refundData.refundable + this.costs.fixedCostsRefund;
        }
    },

    mounted() {
        this.refreshCanRefund();
    },

    methods: {
        ...mapActions({
            refund: 'refund/refund',
            refreshCanRefund: 'refund/canRefund',
            registerCard: 'refund/registerCard'
        })
    }
};
</script>
