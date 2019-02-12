<template>
    <div class="menu">
        <Card to="/dashboard/transfer" class="transfer">
            <h3>Virement</h3>
            <p>Effectuez un transfert vers un autre compte</p>
        </Card>
        <Card v-if="showCard && hasCard && !cardBlocked" to="/dashboard/block">
            <h3>Bloquer mon support cashless</h3>
            <p>
                Votre espace cashless est associé avec la carte numéro <strong>{{ card }}</strong>
            </p>
        </Card>
        <Card v-if="showCard && (!hasCard || cardBlocked)" to="/dashboard/support">
            <h3>Lier mon support cashless</h3>
            <p>Synchronisez votre support avec votre compte</p>
        </Card>
        <Card v-if="showTicket && ticket">
            <h3>Mon billet</h3>
            <p>
                Votre espace cashless est associé avec le billet numéro
                <strong>{{ ticket }}</strong>
            </p>
        </Card>
        <Card v-if="showTicket && !ticket" to="/dashboard/ticket">
            <h3>Mon billet</h3>
            <p>Liez votre billet d'évènement à ce compte cashless</p>
        </Card>
        <Card to="/dashboard/refund">
            <h3>Remboursement de solde</h3>
            <p>
                Faites vous rembourser le solde restant sur votre support (vous devez avoir lié
                votre support)
            </p>
        </Card>
        <Card to="/dashboard/pin">
            <h3>Changement de code PIN</h3>
            <p>Changez votre code de connexion à votre espace cashless</p>
        </Card>
    </div>
</template>

<script>
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
        showTicket: menu.showTicket === '1',
        showCard: menu.showCard === '1'
    }),

    computed: {
        ...mapGetters({
            ticket: 'user/ticket',
            card: 'user/card',
            cardBlocked: 'user/cardBlocked',
            hasCard: 'user/hasCard'
        })
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

.transfer {
    @media (min-width: $break-xs) {
        display: none;
    }
}
</style>
