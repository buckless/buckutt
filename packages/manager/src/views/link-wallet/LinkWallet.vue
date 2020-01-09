<template>
    <ModalLayout :title="$t('views.wallet.link.title')" @close="close">
        <template v-slot>
            <form @submit.prevent="link">
                <PhysicalCard uid="ABCDEF" />

                <Input
                    class="uid"
                    name="uid"
                    type="text"
                    v-model="support"
                    :label="$t('views.wallet.link.identifier')"
                    placeholder="ABCDEF"
                />
            </form>
        </template>

        <template v-slot:actions>
            <Button @click="close">{{ $t('common.cancel') }}</Button>
            <Button raised @click="link">{{ $t('views.wallet.link.link') }}</Button>
        </template>
    </ModalLayout>
</template>

<script>
import { mapActions, mapMutations, mapGetters } from 'vuex';

import Button from 'ui/src/components/Button/Button';
import Input from 'ui/src/components/Input/Input';
import ModalLayout from '../../layouts/Modal';
import PhysicalCard from '../../components/physical-card/PhysicalCard';

export default {
    components: {
        Button,
        Input,
        ModalLayout,
        PhysicalCard
    },

    data: () => ({
        support: ''
    }),

    methods: {
        ...mapActions({
            linkSupport: 'wallet/linkSupport'
        }),

        ...mapMutations({
            setLinkModalOpened: 'wallet/SET_LINK_MODAL_OPENED'
        }),

        async link() {
            await this.linkSupport({ support: this.support });
            this.close();
        },

        close() {
            this.setLinkModalOpened(false);
        }
    },

    computed: mapGetters({
        activeWallet: 'wallet/getActiveWallet'
    })
};
</script>

<style scoped>
.physical-card {
    margin: 20px auto 0 auto;
}

.uid {
    display: block;
    margin-top: 20px;
}
</style>
