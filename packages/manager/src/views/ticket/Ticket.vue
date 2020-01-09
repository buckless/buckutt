<template>
    <DashboardPageLayout>
        <template v-slot:hero>
            <div class="ticket-hero">
                <h2 class="title">{{ $t('views.ticket.hero.title') }} {{ event.name }}</h2>
                <Ticket v-if="ticket" :uid="ticket.physicalId" />
                <Button v-else-if="event.allowTicketLinking" raised to="ticket/link">
                    {{ $t('views.ticket.hero.link') }}
                </Button>
                <span v-else>{{ $t('views.ticket.hero.deactivated') }}</span>
            </div>
        </template>

        <template v-slot>
            <div class="ticket">
                <div class="tips">
                    <ProTip
                        v-if="wallet && !wallet.physicalId"
                        class="protip"
                        :title="$t('views.ticket.tips.preload.title')"
                        :subtitle="$t('views.ticket.tips.preload.subtitle')"
                    />
                    <ProTip
                        v-if="wallet && !ticket && !wallet.physicalId && event.showQrCode"
                        class="protip"
                        :title="$t('views.ticket.tips.fullscreen.title')"
                        :subtitle="$t('views.ticket.tips.fullscreen.subtitle')"
                    />
                    <ProTip
                        v-if="!ticket && event.allowTicketLinking"
                        class="protip"
                        :title="$t('views.ticket.tips.link.title')"
                        :subtitle="$t('views.ticket.tips.link.subtitle')"
                    />
                </div>

                <div
                    class="qrcode"
                    v-if="wallet && !ticket && !wallet.physicalId && event.showQrCode"
                >
                    <h4 class="qrcode-title">{{ $t('views.ticket.qrcode.title') }}</h4>
                    <img ref="qrcode" :src="qrcodeUrl" @click.prevent="toggleFullscreen" />
                </div>

                <router-view />
            </div>
        </template>
    </DashboardPageLayout>
</template>

<script>
import { mapGetters } from 'vuex';
import Button from 'ui/src/components/Button/Button';
import ProTip from 'ui/src/components/ProTip/ProTip';

import DashboardPageLayout from '../../layouts/DashboardPage';

import Ticket from '../../components/ticket/Ticket';

export default {
    components: {
        DashboardPageLayout,
        Button,
        ProTip,
        Ticket
    },

    computed: {
        ...mapGetters({
            wallet: 'wallet/getActiveWallet',
            ticket: 'ticket/getActiveTicket',
            event: 'infos/getEvent'
        }),

        qrcodeUrl() {
            if (!this.wallet) {
                return '';
            }

            const queryParams = ['cht=qr', 'chs=248x248', `chl=${this.wallet.id}`, 'chld=Q|1'].join(
                '&'
            );

            return `https://chart.googleapis.com/chart?${queryParams}`;
        }
    },

    methods: {
        toggleFullscreen() {
            const qrcode = this.$refs.qrcode;

            if (qrcode && qrcode.requestFullscreen) {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    qrcode.requestFullscreen();
                }
            }
        }
    }
};
</script>

<style scoped>
.ticket-hero {
    padding: 60px 60px 24px 60px;
}

.title {
    margin: 0 0 24px 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: 400;
}

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

.qrcode-title {
    font-size: var(--typography-h4-size);
    letter-spacing: var(--typography-h4-spacing);
    font-weight: var(--typography-h4-weight);
}

.qrcode > img {
    cursor: pointer;
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

    .ticket-hero {
        padding: 40px;
    }
}
</style>
