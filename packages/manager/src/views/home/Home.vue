<template>
    <DashboardPageLayout>
        <template v-slot:hero>
            <HomeHero />
        </template>
        <template v-slot>
            <div class="home">
                <div class="tips">
                    <ProTip
                        class="protip"
                        :title="$t('views.home.tips.reload.title')"
                        :subtitle="$t('views.home.tips.reload.subtitle')"
                    />
                    <ProTip
                        class="protip"
                        :title="$t('views.home.tips.refund.title')"
                        :subtitle="refundsContent"
                        v-if="refundsContent"
                    />
                </div>

                <h3 class="history-title">{{ $t('views.home.history.title') }}</h3>

                <HomeHistory />
            </div>
        </template>
    </DashboardPageLayout>
</template>

<script>
import { mapGetters } from 'vuex';

import ProTip from 'ui/src/components/ProTip/ProTip';

import HomeHero from './HomeHero';
import HomeHistory from './HomeHistory';
import DashboardPageLayout from '../../layouts/DashboardPage';

export default {
    components: {
        ProTip,
        HomeHero,
        HomeHistory,
        DashboardPageLayout
    },

    computed: {
        ...mapGetters({
            activeWallet: 'wallet/getActiveWallet'
        }),

        refundsContent() {
            if (
                !this.activeWallet ||
                !this.activeWallet.refunds ||
                (!this.activeWallet.refunds.start && !this.activeWallet.refunds.end)
            ) {
                return;
            }

            const now = new Date();
            const start = new Date(this.activeWallet.refunds.start);
            const end = new Date(this.activeWallet.refunds.end);

            if (start > now) {
                return this.$t('views.home.tips.refund.future', [
                    this.$d(start, 'long'),
                    this.$d(end, 'long')
                ]);
            } else if (start <= now && end >= now) {
                return this.$t('views.home.tips.refund.now', [this.$d(end, 'long')]);
            } else if (end < now) {
                return this.$t('views.home.tips.refund.past', [
                    this.$d(start, 'long'),
                    this.$d(end, 'long')
                ]);
            }
        }
    }
};
</script>

<style scoped>
.tips {
    display: flex;
}

.protip {
    width: 475px;
    margin: 0;
}

.protip:not(:last-child) {
    margin-right: 24px;
}

.history-title {
    margin: 60px 0 24px 0;
    font-size: var(--typography-h4-size);
    letter-spacing: var(--typography-h4-spacing);
    font-weight: var(--typography-h4-weight);
}

.pagination {
    width: 85%;
    max-width: calc(100% - 150px);
}

@media (max-width: 768px) {
    .tips {
        flex-wrap: nowrap;
        height: 105px;
        overflow-y: auto;
    }

    .protip {
        min-width: calc(100vw - 20px - 20px - 4px -4px);
    }

    .history-title {
        margin: 30px 0 16px 0;
    }
}
</style>
