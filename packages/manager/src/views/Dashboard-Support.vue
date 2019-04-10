<template>
    <div class="support">
        <Card>
            <h3>{{ $t('dashboard.menu.link') }}</h3>

            <form v-if="!hasCard" @submit.prevent="assignCard(newCard)">
                {{ $t('dashboard.assign.linkinfo') }}
                <TextInput
                    v-model="newCard"
                    :disabled="working"
                    :label="$t('dashboard.assign.number')"
                    autofocus
                />
                <div class="actions">
                    <Button to="/dashboard/menu">{{ $t('ui.back') }}</Button>
                    <Button :disabled="working" raised>{{ $t('ui.confirm') }}</Button>
                </div>
            </form>
            <p v-else>
                {{ $t('dashboard.menu.lockinfo') }}
                <strong>{{ cardNumber }}</strong
                >.
                <template v-if="cardBlocked">
                    <br />
                    {{ $t('dashboard.assign.lock') }}
                </template>
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
