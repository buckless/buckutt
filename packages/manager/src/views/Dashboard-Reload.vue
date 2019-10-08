<template>
    <div class="reload">
        <Card>
            <div>{{ $t('dashboard.reload.title') }} :</div>
            <div class="credit">
                <span class="actual">{{ (credit / 100) | currency }}</span>
                <span class="pending">
                    <Icon name="access_time" /> {{ (pending / 100) | currency }}
                    {{ $t('dashboard.reload.pending') }}
                </span>
            </div>
            <p class="info">
                {{ $t('dashboard.reload.infopending') }}
            </p>
        </Card>
        <div class="reload-buttons" v-if="displayReload">
            <h3>{{ $t('dashboard.reload.reload') }}</h3>
            <div v-if="buttonsInputs" class="amounts">
                <Button :disabled="working" small raised class="amount" @click="reload(10)"
                    >10€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(20)"
                    >20€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(30)"
                    >30€</Button
                >
                <Button :disabled="working" small raised class="amount" @click="reload(40)"
                    >40€</Button
                >
                <Button
                    :disabled="working"
                    small
                    raised
                    class="amount"
                    @click="buttonsInputs = false"
                    >...</Button
                >
            </div>
            <form v-else :custom="!buttonsInputs" class="amounts" @submit.prevent="reload(amount)">
                <TextInput
                    v-model="amount"
                    :disabled="working"
                    type="number"
                    :label="$t('dashboard.reload.custom')"
                    autofocus
                />
                <Button raised>{{ $t('ui.confirm') }}</Button>
            </form>

            <p class="info">
                <span v-html="$t('dashboard.reload.security')"></span><br />
                <i18n
                    :path="localeToDisplay"
                    tag="span"
                    v-if="costs.fixedCostsReload > 0 || costs.variableCostsReload > 0"
                >
                    <strong place="fixed">{{ (costs.fixedCostsReload / 100) | currency }}</strong>
                    <strong place="variable">{{ costs.variableCostsReload }}%</strong>
                </i18n>
            </p>
            <div v-if="giftReloads && giftReloads.length > 0" class="gifts">
                <div v-for="(giftReload, i) in giftReloads" :key="i" class="gift">
                    Tous les <span>{{ (giftReload.everyAmount / 100) | currency }}</span
                    >, recevez
                    <strong>{{ (giftReload.amount / 100) | currency }}</strong>
                    supplémentaire<template v-if="giftReload.amount > 100"
                        >s</template
                    >.
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Icon from '@/components/Icon';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';

export default {
    name: 'DashboardReload',

    components: {
        Card,
        Icon,
        Button,
        TextInput
    },

    data: () => ({
        buttonsInputs: true,
        amount: '10'
    }),

    computed: {
        ...mapGetters({
            credit: 'user/credit',
            pending: 'history/pending',
            giftReloads: 'user/giftReloads',
            costs: 'user/costs',
            working: 'working/working',
            user: 'user/user',
            reloadData: 'reload/reload'
        }),

        localeToDisplay() {
            if (this.costs.fixedCostsReload > 0 && this.costs.variableCostsReload > 0) {
                return 'dashboard.reload.bankcost3';
            } else if (this.costs.fixedCostsReload > 0) {
                return 'dashboard.reload.bankcost1';
            }

            return 'dashboard.reload.bankcost2';
        },

        displayReload() {
            return this.reloadData.start <= new Date() && this.reloadData.end >= new Date();
        }
    },

    mounted() {
        this.refreshCanReload();
    },

    methods: {
        ...mapActions({
            reloadAction: 'reload/reload',
            refreshCanReload: 'reload/canReload'
        }),

        reload(amount) {
            const intAmount = parseInt(amount, 10);
            const fullAmount =
                intAmount * (1 + this.costs.variableCostsReload / 100) +
                this.costs.fixedCostsReload / 100;

            this.reloadAction({ amount: fullAmount });
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.reload {
    padding: 1rem 0;
}

.info {
    font-size: 0.9rem;
    margin-top: 0.75rem;
    margin-bottom: 0;
}

.credit {
    display: flex;
    align-items: center;
    margin-top: 0.75rem;
}

.credit .actual {
    font-size: 1.5rem;
    font-weight: 500;
}

.credit .pending {
    display: inline-flex;
    align-items: center;
    margin-left: 1.5rem;
}

.credit .pending > :first-child {
    margin-right: 0.25rem;
}

.reload-buttons {
    margin: 1rem;
}

.amounts {
    display: flex;
    align-items: flex-end;
}

.amounts[custom] > :last-child {
    margin-left: 1rem;
}

.amounts > .input {
    margin-left: 1rem;
}

.amount {
    &:not(:last-child) {
        margin-right: 0.75rem;
    }
}

.gifts {
    margin-top: 1rem;
    font-size: 0.9rem;
}
</style>
