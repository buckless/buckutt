<template>
    <div>
        <Card v-if="wallets.length > 0">
            <h3>{{ $t('dashboard.account.title') }}</h3>
            <List>
                <div
                    v-for="(wallet, i) in wallets"
                    :key="i"
                    class="item"
                    @click="setCurrentWallet(wallet)"
                >
                    <span v-if="currentWallet === wallet.id" class="bullet" />
                    <span class="name" v-if="wallet.physical_id">
                        {{ $t('dashboard.account.support') }} {{ wallet.physical_id }}
                    </span>
                    <span class="name" v-else-if="wallet.ticket && wallet.ticket.physical_id">
                        {{ $t('dashboard.account.ticket') }} {{ wallet.ticket.physical_id }}
                    </span>
                    <span class="name" v-else-if="wallet.logical_id">
                        {{ $t('dashboard.account.support') }} {{ wallet.logical_id }}
                    </span>
                    <span class="name" v-else>
                        {{ $t('dashboard.account.virtual') }} {{ i + 1 }}
                    </span>
                    &nbsp;
                    <span class="credit">({{ (wallet.credit / 100) | currency }})</span>
                </div>
            </List>
        </Card>
        <Card to="/dashboard/support" v-if="showCard && !hasCard">
            <h3>{{ $t('dashboard.menu.link') }}</h3>
            <p>{{ $t('dashboard.menu.linkinfo') }}</p>
        </Card>
        <Card to="/dashboard/assign" v-else-if="showRegistration">
            <h3>{{ $t('dashboard.account.create') }}</h3>
            <p>{{ $t('dashboard.account.createinfo') }}</p>
        </Card>
        <Card to="/dashboard/pin">
            <h3>{{ $t('dashboard.account.changepin') }}</h3>
            <p>{{ $t('dashboard.account.changepininfo') }}</p>
        </Card>
        <Button @click="logout">{{ $t('dashboard.account.logout') }}</Button>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import { allowRegistration, menu } from 'config/manager';
import Card from '@/components/Card';
import List from '@/components/List';
import Button from '@/components/Button';

export default {
    name: 'DashboardAccount',

    components: {
        Card,
        List,
        Button
    },

    data: () => ({
        showCard: menu.showCard,
        showRegistration: allowRegistration
    }),

    computed: {
        ...mapGetters({
            currentUser: 'user/user',
            wallets: 'user/wallets',
            currentWallet: 'user/currentWallet',
            hasCard: 'user/hasCard'
        })
    },

    methods: {
        ...mapActions({
            logout: 'user/logout',
            setCurrentWallet: 'user/setCurrentWallet'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.name {
    margin-left: 0.5rem;
}

.credit {
    color: rgba($foreground, 0.8);
}

p {
    margin-top: 0.5rem;
    margin-bottom: 0;
    font-size: 0.9rem;
}

.button {
    display: block;
    margin: 1rem auto;
}
</style>
