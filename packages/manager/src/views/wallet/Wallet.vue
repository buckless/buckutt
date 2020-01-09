<template>
    <DashboardPageLayout>
        <template v-slot:hero>
            <WalletHero />
        </template>
        <template v-slot>
            <div class="wallet">
                <div class="tips">
                    <ProTip
                        class="protip"
                        :title="$t('views.wallet.tips.lock.title')"
                        :subtitle="$t('views.wallet.tips.lock.subtitle')"
                    />
                    <ProTip
                        class="protip"
                        :title="$t('views.wallet.tips.sync.title')"
                        :subtitle="$t('views.wallet.tips.sync.subtitle')"
                    />
                </div>

                <h3 class="wallet-title">{{ $t('views.wallet.transfer.title') }}</h3>

                <form @submit.prevent="handleTransfer" class="transfer">
                    <div class="inputs">
                        <Autocomplete
                            :label="$t('views.wallet.transfer.receiver')"
                            v-model="receiver"
                            :sections="[
                                { id: 'physicals', label: $t('views.wallet.transfer.physicals') },
                                { id: 'users', label: $t('views.wallet.transfer.users') }
                            ]"
                            :suggestions="suggestions"
                            @search="search"
                        />

                        <Input
                            name="amount"
                            :label="$t('views.wallet.transfer.amount')"
                            suffix="€"
                            v-model="amount"
                            :invalid="Boolean(errors.amount)"
                            @blur="validate"
                        />
                    </div>

                    <Button type="submit" raised>{{ $t('views.wallet.transfer.process') }}</Button>
                </form>

                <h3 class="wallet-title">{{ $t('views.wallet.lock.title') }}</h3>
                {{ $t('views.wallet.lock.description') }}<br />
                {{ $t('views.wallet.lock.warning') }}<br /><br />

                <Button
                    raised
                    accent
                    to="wallet/lock"
                    v-if="activeWallet && !activeWallet.blocked"
                    >{{ $t('views.wallet.lock.lock') }}</Button
                >
                <strong v-else>{{ $t('views.wallet.lock.locked') }}</strong>
            </div>

            <router-view />
        </template>
    </DashboardPageLayout>
</template>

<script>
import Autocomplete from 'ui/src/components/Autocomplete/Autocomplete';
import ProTip from 'ui/src/components/ProTip/ProTip';
import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';

import WalletHero from './WalletHero';
import DashboardPageLayout from '../../layouts/DashboardPage';

import { buildValidation } from '../../utils/formValidation';

import { validateTransferForm } from './validate';
import { mapActions, mapGetters } from 'vuex';
import debounce from 'lodash.debounce';

export default {
    components: {
        Autocomplete,
        ProTip,
        Input,
        Button,
        WalletHero,
        DashboardPageLayout
    },

    data: () => ({
        receiver: '',
        physical: '',
        amount: '',
        errors: {}
    }),

    methods: {
        validate: buildValidation(['receiver', 'amount'], validateTransferForm),

        handleTransfer() {
            if (!this.validate()) {
                return;
            }

            const { receiver, amount, physical } = this.$data;

            this.transfer({ receiver, amount, physical });
        },

        search(input) {
            this.physical = input;
            this.searchBounce(input);
        },

        ...mapActions({
            transfer: 'transfer/transfer',
            searchUsers: 'transfer/searchUsers'
        })
    },

    computed: {
        suggestions() {
            return [
                ...this.userWallets,
                { id: this.physical, label: this.physical, section: 'physicals' }
            ];
        },

        ...mapGetters({
            activeWallet: 'wallet/getActiveWallet',
            userWallets: 'transfer/getUserWallets',
            event: 'infos/getEvent'
        })
    },

    created() {
        const searchUsers = this.searchUsers;
        this.searchBounce = debounce(input => searchUsers({ input }), 300);
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

.wallet-title {
    margin: 40px 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: var(--typography-h3-weight);
}

.transfer {
    max-width: 500px;
}

.inputs {
    display: flex;
    margin-bottom: 16px;
}

.inputs > :first-child {
    flex: 3;
}

.inputs > :last-child {
    flex: 1;
    margin-left: 24px;
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

    .wallet-title {
        margin: 30px 0 16px 0;
    }

    .inputs {
        flex-direction: column;
    }

    .inputs > :last-child {
        margin-left: 0;
    }
}
</style>
