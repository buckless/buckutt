<template>
    <div class="support">
        <Card>
            <h3>Lier mon support cashless</h3>

            <form v-if="!hasCard || cardBlocked" @submit.prevent="assignCard(card)">
                <template v-if="blockedCards.length > 0">
                    Ce compte est associé avec les supports bloqués suivants:
                    <span v-for="(blockedCard, index) in blockedCards" :key="index">
                        <strong>{{ blockedCard }}</strong>
                        <template v-if="index < blockedCards.length - 1"
                            >,
                        </template>
                        <template v-else
                            >.</template
                        >
                    </span>
                    <br /><br />
                </template>

                Pour lier un nouveau support à votre espace cashless, saisissez ici l'identifiant
                présent au dos de celui-ci.
                <TextInput v-model="card" :disabled="working" label="Numéro de support" autofocus />
                <div class="actions">
                    <Button to="/dashboard/menu">Retour</Button>
                    <Button :disabled="working" raised>Valider</Button>
                </div>
            </form>
            <p v-else>
                Votre espace cashless est associé avec le support <strong>{{ cardNumber }}</strong
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
    name: 'DashboardSupport',

    components: {
        Card,
        TextInput,
        Button
    },

    data: () => ({
        card: ''
    }),

    computed: {
        ...mapGetters({
            hasCard: 'user/hasCard',
            cardNumber: 'user/card',
            cardBlocked: 'user/cardBlocked',
            blockedCards: 'user/blockedCards',
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
