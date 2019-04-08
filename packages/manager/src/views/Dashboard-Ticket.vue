<template>
    <div class="refund">
        <Card>
            <h3>{{ $t('dashboard.menu.ticket') }}</h3>
            <form v-if="!ticketNumber" @submit.prevent="assignTicket(ticket)">
                {{ $t('dashboard.ticket.info') }}
                <TextInput
                    v-model="ticket"
                    :disabled="working"
                    :label="$t('dashboard.ticket.number')"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/menu">{{ $t('ui.back') }}</Button>
                    <Button :disabled="working" raised>{{ $t('ui.confirm') }}</Button>
                </div>
            </form>
            <p v-else>
                {{ $t('dashboard.menu.ticketinfo') }}
                <strong>{{ ticketNumber }}</strong
                >.
                <br />
                <br />
                <Button raised to="/dashboard/menu">{{ $t('ui.back') }}</Button>
            </p>
        </Card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';

export default {
    name: 'DashboardTicket',

    components: {
        Card,
        TextInput,
        Button
    },

    data: () => ({
        ticket: ''
    }),

    computed: {
        ...mapGetters({
            ticketNumber: 'user/ticket',
            working: 'working/working'
        })
    },

    methods: {
        ...mapActions({
            assignTicket: 'assign/ticket'
        })
    }
};
</script>

<style lang="scss" scoped>
.input-wrapper {
    margin-top: 1rem;
}
</style>
