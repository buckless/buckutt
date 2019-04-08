<template>
    <div class="block">
        <Card>
            <h3>{{ $t('dashboard.menu.lock') }}</h3>

            <form v-if="hasCard && !cardBlocked" @submit.prevent="block(card)">
                {{ $t('dashboard.menu.lockinfo') }} <strong>{{ card }}</strong
                >.<br /><br />
                {{ $t('dashboard.lock.question') }}
                <br />
                <br />
                <div class="actions">
                    <Button :disabled="working" raised>{{ $t('dashboard.lock.button') }}</Button>
                </div>
            </form>
            <template v-else>
                <p>
                    {{ $t('dashboard.lock.info') }}
                    <strong>{{ card }}</strong>
                    <br />
                    <br />
                </p>
                <div class="actions">
                    <Button raised to="/dashboard/menu">{{ $t('ui.back') }}</Button>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardBlock',

    components: {
        Card,
        Button
    },

    computed: {
        ...mapGetters({
            card: 'user/card',
            cardBlocked: 'user/cardBlocked',
            hasCard: 'user/hasCard',
            working: 'working/working'
        })
    },

    mounted() {
        if (!this.hasCard) {
            this.$router.push('/dashboard/menu');
        }
    },

    methods: {
        ...mapActions({
            block: 'assign/block'
        })
    }
};
</script>
