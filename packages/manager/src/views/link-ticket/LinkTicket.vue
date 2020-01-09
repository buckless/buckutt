<template>
    <ModalLayout :title="$t('views.ticket.link.title')" @close="close">
        <template v-slot v-if="activeWallet">
            <form v-if="!activeTicket" @submit.prevent="link">
                <Ticket uid="T123456" />

                <Input
                    class="uid"
                    name="uid"
                    type="text"
                    v-model="ticket"
                    :label="$t('views.ticket.link.number')"
                    placeholder="T123456"
                />
            </form>
            <i18n path="views.ticket.link.alreadyLinked" tag="span" v-else>
                <strong>{{ activeTicket.physicalId }}</strong>
            </i18n>
        </template>

        <template v-slot:actions>
            <Button to="/dashboard/ticket">{{ $t('common.cancel') }}</Button>
            <Button raised @click="link" v-if="!activeTicket">{{
                $t('views.ticket.link.link')
            }}</Button>
        </template>
    </ModalLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Button from 'ui/src/components/Button/Button';
import Input from 'ui/src/components/Input/Input';
import ModalLayout from '../../layouts/Modal';
import Ticket from '../../components/ticket/Ticket';

export default {
    components: {
        Button,
        Input,
        ModalLayout,
        Ticket
    },

    data: () => ({
        ticket: ''
    }),

    methods: {
        ...mapActions({
            linkTicket: 'ticket/linkTicket'
        }),

        async link() {
            await this.linkTicket({ ticket: this.ticket });
            this.close();
        },

        close() {
            this.$router.push('/dashboard/ticket');
        }
    },

    computed: mapGetters({
        activeWallet: 'wallet/getActiveWallet',
        activeTicket: 'ticket/getActiveTicket'
    })
};
</script>

<style scoped>
.ticket {
    margin: 20px auto 0 auto;
}

.uid {
    display: block;
    margin-top: 20px;
}
</style>
