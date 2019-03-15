<template>
    <div class="menu">
        <Card to="/dashboard/transfer" class="transfer">
            <h3>Virement</h3>
            <p>Effectuez un transfert vers un autre porte-monnaie</p>
        </Card>
        <Card v-if="showCard && hasCard" to="/dashboard/block">
            <h3>Bloquer mon support cashless</h3>
            <p>
                Votre porte-monnaie cashless est associé avec la carte numéro
                <strong>{{ card }}</strong>
            </p>
        </Card>
        <Card v-if="showCard && !hasCard" to="/dashboard/support">
            <h3>Lier mon support cashless</h3>
            <p>Synchronisez votre support avec votre porte-monnaie</p>
        </Card>
        <Card v-if="showTicket && ticket">
            <h3>Mon billet</h3>
            <p>
                Ce porte-monnaie est associé avec le billet numéro
                <strong>{{ ticket }}</strong>
            </p>
        </Card>
        <Card v-if="showTicket && !ticket" to="/dashboard/ticket">
            <h3>Mon billet</h3>
            <p>Liez votre billet d'évènement à ce porte-monnaie cashless</p>
        </Card>
        <Card v-if="showQrCode && !hasCard" class="card-qrcode" @click.native="toggleQrcode">
            <h3>Mon QR Code</h3>
            <p>
                Une fois sur place, vous pourrez utiliser ce QR Code ou votre billet pour récupérer
                votre support cashless.
            </p>
            <img :src="baseQrCode + currentWallet" alt="qr code" v-if="qrcodeVisible" />
        </Card>
        <Card to="/dashboard/refund">
            <h3>Remboursement de solde</h3>
            <p>
                Faites vous rembourser le solde restant de ce porte-monnaie
            </p>
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
