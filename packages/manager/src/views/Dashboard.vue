<template>
    <div class="dashboard">
        <Tabs :tabs="tabs">
            <router-view />
        </Tabs>
    </div>
</template>

<script>
import Tabs from '@/components/Tabs';

export default {
    name: 'Dashboard',

    components: {
        Tabs
    },

    computed: {
        tabs() {
            return [
                { name: this.$t('tabs.reload'), route: '/dashboard/reload' },
                { name: this.$t('tabs.history'), route: '/dashboard/history' },
                {
                    name: this.$t('tabs.transfer'),
                    route: '/dashboard/transfer',
                    classes: 'transfer'
                },
                { name: this.$t('tabs.other'), route: '/dashboard/menu' }
            ];
        }
    }
};
</script>

<style lang="scss">
@import '@/theme.scss';

.dashboard nav .transfer {
    @media (max-width: $break-xs) {
        display: none;
    }
}
</style>
