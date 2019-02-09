<template>
    <div class="pin">
        <Card>
            <h3>Changement de code PIN</h3>
            <form @submit.prevent="changePin(currentPin, pin, confirmation)">
                <TextInput
                    v-model="currentPin"
                    :disabled="working"
                    type="password"
                    label="Code PIN actuel"
                    maxlength="4"
                    autofocus
                />
                <TextInput
                    v-model="pin"
                    :disabled="working"
                    type="password"
                    label="Nouveau code PIN"
                    maxlength="4"
                />
                <TextInput
                    v-model="confirmation"
                    :disabled="working"
                    type="password"
                    label="Confirmation"
                    maxlength="4"
                />

                <div class="actions">
                    <Button to="/dashboard/menu">Retour</Button>

                    <Button :disabled="working" raised>Modifier</Button>
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
    name: 'DashboardPIN',

    components: {
        Card,
        TextInput,
        Button
    },

    data: () => ({
        currentPin: '',
        pin: '',
        confirmation: ''
    }),

    computed: {
        ...mapGetters({
            working: 'working/working'
        })
    },

    methods: {
        async changePin(currentPin, pin, confirmation) {
            await this.processChangePin({ currentPin, pin, confirmation });

            this.$router.push('/dashboard/menu');
        },

        ...mapActions({
            processChangePin: 'pin/change'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.pin .input-wrapper {
    margin-top: 1rem;
}
</style>
