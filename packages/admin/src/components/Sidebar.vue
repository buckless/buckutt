<template>
    <div class="b-sidebar" v-if="logged">
        <h1 class="b-sidebar__title">{{ name }}</h1>
        <div class="b-sidebar__links-wrapper">
            <ul class="b-sidebar__links">
                <li class="b-sidebar__links__link">
                    <router-link to="/stats">
                        <b-icon name="insert_chart" :size="24" />
                        Résumé
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/treasury">
                        <b-icon name="attach_money" :size="24" />
                        Trésorerie
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/events">
                        <b-icon name="settings" :size="24" />
                        Configuration
                    </router-link>
                </li>
            </ul>
            <ul class="b-sidebar__links">
                <li class="b-sidebar__category">
                    Vente
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/points">
                        <b-icon name="location_on" :size="24" />
                        Guichets
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/articles">
                        <b-icon name="free_breakfast" :size="24" />
                        Articles
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/promotions">
                        <b-icon name="stars" :size="24" />
                        Formules
                    </router-link>
                </li>
            </ul>
            <ul class="b-sidebar__links">
                <li class="b-sidebar__category">
                    Utilisateurs
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/users">
                        <b-icon name="person" :size="24" />
                        Comptes
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/wallets">
                        <b-icon name="account_balance_wallet" :size="24" />
                        Puces
                    </router-link>
                </li>
            </ul>
            <ul class="b-sidebar__links">
                <li class="b-sidebar__category">
                    Terminaux
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/devices">
                        <b-icon name="devices" :size="24" />
                        Équipements
                    </router-link>
                </li>
                <li class="b-sidebar__links__link">
                    <router-link to="/alerts">
                        <b-icon name="add_alert" :size="24" />
                        Alertes
                    </router-link>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { name } from 'config/admin';
import { mapGetters } from 'vuex';

export default {
    data: () => ({
        name
    }),

    computed: {
        ...mapGetters(['logged'])
    }
};
</script>

<style scoped>
@import '../variables.css';

.b-sidebar {
    background: var(--primary-400);
    height: 100%;
    min-width: var(--sidebarWidth);
    overflow-y: auto;
}

.b-sidebar__title {
    color: var(--grey-50);
    background-color: var(--primary-500);
    font-size: var(--sidebarTitleSize);
    font-weight: var(--sidebarTitleWeight);
    padding: var(--sidebarTitlePadding);
    height: var(--sidebarTitleHeight);
    margin-top: 0px;
    margin-bottom: 10px;
    text-align: center;
}

.b-sidebar__links-wrapper {
    height: calc(100% - var(--sidebarTitleHeight) - 12px);
    overflow: auto;
}

.b-sidebar__links {
    list-style: none;
    padding-left: 0;
    width: 100%;
    margin: auto;
}

.b-sidebar__links__link {
    text-transform: uppercase;
    margin: 0 12px;
    padding: 0 16px;
}

.b-sidebar__links__link:hover {
    background-color: lighten(var(--sidebarBackground), 10%);
}

.b-sidebar__links__link a {
    color: var(--grey-50);
    height: var(--sidebarLinkHeight);
    line-height: var(--sidebarLinkHeight);
    font-size: var(--sidebarLinkSize);
    text-decoration: none;
    width: 100%;
    display: flex;
    align-items: center;
}

.b-sidebar__links__link:hover {
    background: var(--sidebarLinkHover);
    border-radius: 6px;
}

.b-sidebar__links__link span {
    margin-right: 15px;
}

.b-sidebar__category {
    color: var(--grey-50);
    text-align: center;
    font-size: 14px;
    font-weight: bold;
    padding-top: 20px;
    margin-bottom: 8px;
}
</style>
