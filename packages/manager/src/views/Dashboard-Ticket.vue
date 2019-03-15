<template>
    <div class="refund">
        <Card>
            <h3>Mon billet</h3>
            <form v-if="!ticketNumber" @submit.prevent="assignTicket(ticket)">
                Pour lier votre billet d'entrée à ce porte-monnaie cashless, saisissez ici votre
                numéro de billet.
                <TextInput
                    v-model="ticket"
                    :disabled="working"
                    label="Numéro de billet"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/menu">Retour</Button>
                    <Button :disabled="working" raised>Valider</Button>
                </div>
            </form>
            <p v-else>
                Votre espace cashless est associé avec le billet numéro
                <strong>{{ ticketNumber }}</strong
                >.
                <br />
                <br />
                <Button raised to="/dashboard/menu">Retour</Button>
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
