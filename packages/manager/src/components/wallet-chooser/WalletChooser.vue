<template>
    <div>
        <Button
            class="select"
            :whiteBackground="isWindowSmall"
            @click="handleOpenWalletChooserModal"
        >
            <Icon class="icon" name="credit_card" />
            {{ currentWalletName }}
        </Button>

        <ModalLayout v-if="chooserModalOpened" @close="handleCloseWalletChooserModal" :title="$t('components.chooser.wallets')">
            <template v-slot>
                <div class="wallets">
                    <Button
                        v-for="wallet in formattedWallets"
                        :key="wallet.id"
                        :raised="activeWallet.id === wallet.id"
                        @click="handleWalletChooserChange(wallet)"
                    >
                        {{ wallet.name }}
                    </Button>
                </div>
            </template>

            <template v-slot:actions>
                <Button @click="handleOpenLinkModal">
                    {{ $t('components.chooser.add') }}
                </Button>
            </template>
        </ModalLayout>

        <LinkWallet v-if="linkModalOpened" />
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex';
import Button from 'ui/src/components/Button/Button';
import Icon from 'ui/src/components/Icon/Icon';
import ModalLayout from '../../layouts/Modal';
import { format } from '../../utils/money';

import LinkWallet from '../../views/link-wallet/LinkWallet';

const getWalletName = (virtualWalletLabel, { physicalId, credit }) => {
    const name = physicalId || virtualWalletLabel;

    const walletCredit = format({
        amount: credit
    });

    return `${name} (${walletCredit})`;
};

export default {
    components: {
        Button,
        Icon,
        ModalLayout,
        LinkWallet
    },

    data: () => ({
        isWindowSmall: window.matchMedia('(max-width: 768px)').matches,
    }),

    computed: {
        ...mapGetters({
            wallets: 'wallet/getWallets',
            activeWallet: 'wallet/getActiveWallet',
            linkModalOpened: 'wallet/getLinkModalOpened',
            chooserModalOpened: 'wallet/getChooserModalOpened',
            event: 'infos/getEvent'
        }),

        currentWalletName() {
            if (!this.activeWallet) {
                return;
            }

            return getWalletName(this.$t('components.chooser.virtualWallet'), this.activeWallet);
        },

        formattedWallets() {
            return this.wallets.map(wallet => ({
                id: wallet.id,
                name: getWalletName(this.$t('components.chooser.virtualWallet'), wallet)
            }));
        }
    },

    methods: {
        ...mapMutations({
            setLinkModalOpened: 'wallet/SET_LINK_MODAL_OPENED',
            setChooserModalOpened: 'wallet/SET_CHOOSER_MODAL_OPENED'
        }),

        ...mapActions({
            changeActiveWallet: 'wallet/changeActiveWallet'
        }),

        handleOpenWalletChooserModal() {
            this.setChooserModalOpened(true);
        },

        handleCloseWalletChooserModal() {
            this.setChooserModalOpened(false);
        },

        handleOpenLinkModal() {
            this.setChooserModalOpened(false);
            this.setLinkModalOpened(true);
        },

        handleWalletChooserChange(wallet) {
            this.changeActiveWallet(wallet.id);
            this.setChooserModalOpened(false);
        },

        handleMediaQueryChange(e) {
            this.isWindowSmall = e.matches;
        }
    },

    mounted() {
        this.mql = window.matchMedia('(max-width: 768px)');

        this.mql.addEventListener('change', this.handleMediaQueryChange);
    },

    beforeDestroy() {
        this.mql.removeEventListener('change', this.handleMediaQueryChange);
    }
};
</script>

<style scoped>
.icon {
    margin-right: 4px;
}

.wallets {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

@media (max-width: 768px) {
    .select {
        color: var(--grey-50);
    }
}
</style>
