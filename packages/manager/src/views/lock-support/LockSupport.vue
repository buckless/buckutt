<template>
    <ModalLayout :title="$t('views.wallet.lock.modalTitle')" @close="close">
        <template v-slot v-if="activeWallet">
            <span v-if="!activeWallet.blocked">
                <i18n path="views.wallet.lock.confirmation" tag="span">
                    <strong>{{ activeWallet.physicalId }}</strong>
                </i18n>
                <br />
                {{ $t('views.wallet.lock.warning') }}
            </span>
            <i18n path="views.wallet.lock.already" tag="span" v-else>
                <strong>{{ activeWallet.physicalId }}</strong>
            </i18n>
        </template>

        <template v-slot:actions v-if="activeWallet">
            <Button to="/dashboard/wallet">{{ $t('common.cancel') }}</Button>
            <Button raised @click="lock" v-if="!activeWallet.blocked">{{
                $t('common.confirm')
            }}</Button>
        </template>
    </ModalLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Button from 'ui/src/components/Button/Button';
import ModalLayout from '../../layouts/Modal';

export default {
    components: {
        Button,
        ModalLayout
    },

    methods: {
        ...mapActions({
            lockWallet: 'wallet/lockWallet'
        }),

        async lock() {
            await this.lockWallet();
            this.close();
        },

        close() {
            this.$router.push('/dashboard/wallet');
        }
    },

    computed: mapGetters({
        activeWallet: 'wallet/getActiveWallet'
    })
};
</script>
