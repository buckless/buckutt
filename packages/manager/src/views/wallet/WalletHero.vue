<template>
    <div class="wallet-hero">
        <h2 class="title">{{ $t('views.wallet.hero.title') }}</h2>
        <div class="supports">
            <PhysicalCard
                v-if="activeWallet"
                :uid="activeWallet.physicalId"
                :amount="activeWallet.credit"
            />
        </div>
        <p class="pending desktop">
            {{ $t('views.wallet.hero.pending') }} {{ formattedPending }}
            <Icon name="hourglass_empty" :size="18" />
        </p>
        <p class="pending mobile">
            <span>{{ $t('views.wallet.hero.pendingMobile') }} </span>
            <span class="amount"
                >{{ formattedPending }} <Icon name="hourglass_empty" :size="18"
            /></span>
        </p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Icon from 'ui/src/components/Icon/Icon';
import Button from 'ui/src/components/Button/Button';

import { format } from '../../utils/money';

import PhysicalCard from '../../components/physical-card/PhysicalCard';

export default {
    components: {
        Icon,
        Button,
        PhysicalCard
    },

    computed: {
        ...mapGetters({
            activeWallet: 'wallet/getActiveWallet',
            pending: 'history/getPending'
        }),

        formattedPending() {
            return format({ amount: this.pending, showPlus: true });
        }
    }
};
</script>

<style scoped>
.wallet-hero {
    padding: 60px 60px 24px 60px;
}

.title {
    margin: 0 0 24px 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: 400;
}

.supports {
    display: flex;
    align-items: center;
    height: calc(150px - 12px);
}

.physical-card {
    /* scale it down so it looses 12px of height */
    transform: scale(calc((150 - 12) / 150));
}

.pending {
    display: flex;
    align-items: center;
    margin-top: 24px;
    margin-bottom: 0;
}

.pending .icon {
    margin-left: 8px;
}

.pending.mobile {
    display: none;
}

.pending.mobile .amount {
    display: inline-flex;
    align-items: center;
}

@media (max-width: 768px) {
    .wallet-hero {
        padding: 20px;
    }

    .physical-card {
        transform: scale(1);
    }

    .pending.mobile {
        display: block;
    }

    .pending.desktop {
        display: none;
    }
}
</style>
