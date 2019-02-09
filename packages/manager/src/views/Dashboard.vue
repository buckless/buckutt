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

    data: () => ({
        tabs: [
            { name: 'Charger', route: '/dashboard/reload' },
            { name: 'Historique', route: '/dashboard/history' },
            {
                name: 'Virement',
                route: '/dashboard/transfer',
                classes: 'transfer'
            },
            { name: 'Autre', route: '/dashboard/menu' }
        ]
    })
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
