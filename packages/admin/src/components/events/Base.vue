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
                title="Rechargements"
                subtitle="Coûts, moyens de paiement, offres..."
                to="/events/reloads"
                :active="isActive('reloads')"
            ></b-listitem>
            <b-listitem
                icon="money_off"
                title="Remboursements"
                subtitle="Dates d'ouverture, coûts..."
                to="/events/refunds"
                :active="isActive('refunds')"
            ></b-listitem>
            <b-listitem
                icon="call_made"
                title="Webhooks"
                to="/events/advanced/webservices"
                subtitle="Webhooks sur les achats (avancé)"
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
