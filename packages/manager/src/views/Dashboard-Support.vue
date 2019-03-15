<template>
    <div class="support">
        <Card>
            <h3>Lier mon support cashless</h3>

            <form v-if="!hasCard" @submit.prevent="assignCard(newCard)">
                Pour lier un nouveau support à ce porte-monnaie cashless, saisissez ici
                l'identifiant présent au dos de celui-ci.
                <TextInput
                    v-model="newCard"
                    :disabled="working"
                    label="Numéro de support"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/menu">Retour</Button>
                    <Button :disabled="working" raised>Valider</Button>
                </div>
            </form>
            <p v-else>
                Votre porte-monnaie cashless est associé avec le support
                <strong>{{ cardNumber }}</strong
                >.
                <template v-if="cardBlocked">
                    <br />
                    Ce support est actuellement bloqué à votre demande. Adressez-vous à un
                    organisateur pour le débloquer.
                </template>
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
    name: 'DashboardSupport',

    components: {
        Card,
        TextInput,
        Button
    },

    data: () => ({
        newCard: ''
    }),

    computed: {
        ...mapGetters({
            hasCard: 'user/hasCard',
            cardNumber: 'user/card',
            cardBlocked: 'user/cardBlocked',
            working: 'working/working'
        })
    },

    methods: {
        ...mapActions({
            assignCard: 'assign/card'
        })
    }
};
</script>

<style lang="scss" scoped>
.input-wrapper {
    margin-top: 1rem;
}
</style>
