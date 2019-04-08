<template>
    <div class="assign">
        <Card>
            <h3>{{ $t('dashboard.account.create') }}</h3>

            <form @submit.prevent="assign(newCard)">
                {{ $t('dashboard.assign.info') }}
                <TextInput
                    v-model="newCard"
                    :disabled="working"
                    :label="$t('dashboard.assign.number')"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/account">{{ $t('ui.back') }}</Button>
                    <Button :disabled="working" raised>{{ $t('ui.confirm') }}</Button>
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
