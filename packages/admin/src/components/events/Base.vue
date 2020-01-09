<template>
    <div class="b-events">
        <div class="b-events-menu">
            <b-listitem
                icon="event"
                title="Événement"
                to="/events/event"
                subtitle="Dates, périodes, groupes, fondations..."
                :active="isActive('event')"
            ></b-listitem>
            <b-listitem
                icon="attach_money"
                title="Paiements"
                subtitle="Limites, moyens de paiement, offres..."
                to="/events/payments"
                :active="isActive('payments')"
            ></b-listitem>
            <b-listitem
                icon="public"
                title="Espace client"
                subtitle="Paramètres généraux, transactions en ligne..."
                to="/events/manager"
                :active="isActive('manager')"
            ></b-listitem>
            <b-listitem
                icon="developer_board"
                title="Paramètres avancés"
                to="/events/advanced/coupons"
                subtitle="Webhooks, coupons de consommation..."
                :active="isActive('advanced')"
            ></b-listitem>
        </div>
        <router-view
            :key="$route.path.split('/')[2] || $route.path"
            class="b-base-right"
        ></router-view>
    </div>
</template>

<script>
export default {
    methods: {
        isActive(path) {
            return this.$route.path.indexOf(`/events/${path}`) > -1;
        }
    }
};
</script>

<style scoped>
.b-events {
    display: flex;

    & > .b-events-menu {
        width: 340px;
        height: 100%;
        background-color: #e9e9e9;
        overflow-y: auto;
    }
}
</style>
