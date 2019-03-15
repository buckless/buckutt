<template>
    <div class="assign">
        <Card>
            <h3>Créer un nouveau porte-monnaie</h3>

            <form @submit.prevent="assign(newCard)">
                Pour créer un nouveau porte-monnaie cashless à partir de votre support, saisissez
                ici l'identifiant présent au dos de celui-ci.
                <TextInput
                    v-model="newCard"
                    :disabled="working"
                    label="Numéro de support"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/account">Retour</Button>
                    <Button :disabled="working" raised>Valider</Button>
                </div>
            </form>
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
            working: 'working/working'
        })
    },

    methods: {
        async assign(payload) {
            await this.createWallet(payload);

            this.$router.push('/dashboard/account');
        },

        ...mapActions({
            createWallet: 'assign/create'
        })
    }
};
</script>

<style lang="scss" scoped>
.input-wrapper {
    margin-top: 1rem;
}
</style>
