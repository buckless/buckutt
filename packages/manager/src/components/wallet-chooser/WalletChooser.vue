<template>
    <div>
        <Select
            class="wallet-chooser-select"
            :label="$t('components.chooser.support')"
            :options="walletChooserOptions"
            :value="walletChooserValue"
            @change="handleWalletChooserChange"
        />

        <LinkWallet v-if="linkModalOpened" />
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import Select from 'ui/src/components/Select/Select';

import LinkWallet from '../../views/link-wallet/LinkWallet';

const addOptionId = 'buckless-add';

export default {
    components: {
        Select,
        LinkWallet
    },

    computed: {
        ...mapGetters({
            wallets: 'wallet/getWallets',
            activeWallet: 'wallet/getActiveWallet',
            linkModalOpened: 'wallet/getLinkModalOpened',
            event: 'infos/getEvent'
        }),

        walletChooserValue() {
            return this.activeWallet && this.activeWallet.id;
        },

        walletChooserOptions() {
            const addOption = {
                value: addOptionId,
                name: this.$t('components.chooser.add'),
                disabled: !this.event.allowCardLinking
            };

            if (this.wallets.length === 0) {
                return [
                    {
                        value: 'buckless-empty',
                        name: this.$t('components.chooser.empty'),
                        disabled: true
                    },
                    addOption
                ];
            }

            return [
                ...this.wallets.map(wallet => ({
                    value: wallet.id,
                    name: wallet.physicalId
                })),
                addOption
            ];
        }
    },

    methods: {
        ...mapMutations({
            setLinkModalOpened: 'wallet/SET_LINK_MODAL_OPENED'
        }),

        ...mapActions({
            changeActiveWallet: 'wallet/changeActiveWallet'
        }),

        handleWalletChooserChange(value) {
            if (value === addOptionId) {
                return this.setLinkModalOpened(true);
            }

            this.changeActiveWallet({ id: value });
        }
    }
};
</script>

<style scoped>
.wallet-chooser-select {
    color: var(--grey-50);
}
</style>
