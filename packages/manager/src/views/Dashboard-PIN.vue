<template>
    <div class="pin">
        <Card>
            <h3>{{ $t('dashboard.account.changepin') }}</h3>
            <form @submit.prevent="changePin(currentPin, pin, confirmation)">
                <TextInput
                    v-model="currentPin"
                    :disabled="working"
                    type="password"
                    :label="$t('dashboard.pin.current')"
                    maxlength="4"
                    autofocus
                />
                <TextInput
                    v-model="pin"
                    :disabled="working"
                    type="password"
                    :label="$t('dashboard.pin.new')"
                    maxlength="4"
                />
                <TextInput
                    v-model="confirmation"
                    :disabled="working"
                    type="password"
                    :label="$t('dashboard.pin.confirm')"
                    maxlength="4"
                />

                <div class="actions">
                    <Button to="/dashboard/account">{{ $t('ui.back') }}</Button>

                    <Button :disabled="working" raised>{{ $t('ui.modify') }}</Button>
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

            this.$router.push('/dashboard/account');
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
