<template>
    <div class="menu">
        <Card to="/dashboard/transfer" class="transfer">
            <h3>{{ $t('dashboard.menu.transfer') }}</h3>
            <p>{{ $t('dashboard.menu.transferinfo') }}</p>
        </Card>
        <Card v-if="showCard && hasCard" to="/dashboard/block">
            <h3>{{ $t('dashboard.menu.lock') }}</h3>
            <p>
                {{ $t('dashboard.menu.lockinfo') }}
                <strong>{{ card }}</strong>
            </p>
        </Card>
        <Card v-if="showCard && !hasCard" to="/dashboard/support">
            <h3>{{ $t('dashboard.menu.link') }}</h3>
            <p>{{ $t('dashboard.menu.linkinfo') }}</p>
        </Card>
        <Card v-if="showTicket && ticket">
            <h3>{{ $t('dashboard.menu.ticket') }}</h3>
            <p>
                {{ $t('dashboard.menu.ticketinfo') }}
                <strong>{{ ticket }}</strong>
            </p>
        </Card>
        <Card v-if="showTicket && !ticket" to="/dashboard/ticket">
            <h3>{{ $t('dashboard.menu.ticket') }}</h3>
            <p>{{ $t('dashboard.menu.ticketlink') }}</p>
        </Card>
        <Card v-if="showQrCode && !hasCard" class="card-qrcode" @click.native="toggleQrcode">
            <h3>{{ $t('dashboard.menu.qr') }}</h3>
            <p>{{ $t('dashboard.menu.qrinfo') }}</p>
            <img :src="baseQrCode + currentWallet" alt="qr code" v-if="qrcodeVisible" />
        </Card>
        <Card to="/dashboard/refund">
            <h3>{{ $t('dashboard.menu.refund') }}</h3>
            <p>{{ $t('dashboard.menu.refundinfo') }}</p>
        </Card>
    </div>
</template>

<script>
import { accountShowQrcode } from 'config/manager';
import { menu } from 'config/manager';
import { mapGetters } from 'vuex';
import Card from '@/components/Card';
import List from '@/components/List';

export default {
    name: 'DashboardMenu',

    components: {
        Card,
        List
    },

    data: () => ({
        showTicket: menu.showTicket,
        showCard: menu.showCard,
        showQrCode: accountShowQrcode,
        baseQrCode: `https://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=`,
        qrcodeVisible: false
    }),

    computed: {
        ...mapGetters({
            ticket: 'user/ticket',
            card: 'user/card',
            hasCard: 'user/hasCard',
            currentWallet: 'user/currentWallet'
        })
    },

    methods: {
        toggleQrcode() {
            this.qrcodeVisible = !this.qrcodeVisible;
        }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.menu {
    max-width: 100% !important;
    width: 100%;
}

h3 {
    font-size: 1.05rem;
    margin-bottom: 0;
}

p {
    margin-top: 0.5rem;
    margin-bottom: 0;
    font-size: 0.9rem;
}

img {
    display: block;
    max-width: 100%;
    margin: 1rem auto;
}

.card-qrcode {
    cursor: pointer;
}

.transfer {
    @media (min-width: $break-xs) {
        display: none;
    }
}
</style>
