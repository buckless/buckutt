<template>
    <div class="refund">
        <Card>
            <h3>{{ $t('dashboard.menu.refund') }}</h3>

            <p>
                {{ $t('dashboard.refund.info') }}

                <br />
                <br />

                <template v-if="refundData.allowed">
                    <i18n path="dashboard.refund.amount" tag="span">
                        <span place="amount">{{ (refundData.refundable / 100) | currency }}</span>
                        <span place="end">{{ refundData.end | date }}</span>
                    </i18n>
                    <br />
                    <i18n path="dashboard.refund.bankfee" tag="span" v-if="refundCost > 0">
                        <strong place="amount">{{ (refundCost / 100) | currency }}</strong>
                        <strong place="refunded">
                            {{ ((refundData.refundable - refundCost) / 100) | currency }}
                        </strong>
                    </i18n>
                    <template v-if="refundData.cardRegistered">
                        <br />
                        <span v-html="$t('dashboard.refund.cardinfo')"></span>
                        <br />
                        <br />
                        {{ $t('dashboard.refund.new') }}
                        <strong @click="registerCard" class="refundLink">{{
                            $t('dashboard.refund.here')
                        }}</strong
                        >.
                    </template>
                </template>
                <template v-else>
                    <div v-for="(error, i) in whyCantRefund" :key="i">
                        {{ error }}
                    </div>
                </template>
            </p>

            <form class="actions" @submit.prevent="refund">
                <Button to="/dashboard/menu">{{ $t('ui.back') }}</Button>
                <Button
                    v-if="refundData.allowed && refundData.cardRegistered"
                    :disabled="working"
                    raised
                    >{{ $t('dashboard.refund.refund') }}</Button
                >
                <Button
                    v-if="refundData.allowed && !refundData.cardRegistered"
                    :disabled="working"
                    raised
                    @click.prevent="registerCard"
                    >{{ $t('dashboard.refund.newcard') }}</Button
                >
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
            return (
                (this.costs.variableCostsRefund / 100) * this.refundData.refundable +
                this.costs.fixedCostsRefund
            );
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

<style lang="scss" scoped>
.refundLink {
    cursor: pointer;
}
</style>
