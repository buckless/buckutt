<template>
    <transition name="slide">
        <div class="b-sidebar" v-show="logged">
            <h1>{{ barName }}</h1>
            <ul>
                <li>
                    <router-link to="/" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                        <i class="material-icons">home</i>
                        Accueil
                    </router-link>
                </li>
                <li>
                    <router-link to="/treasury" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                        <i class="material-icons">attach_money</i>
                        Trésorerie
                    </router-link>
                </li>
            </ul>
            <transition name="fade">
                <ul v-if="currentEvent">
                    <li class="b-sidebar__separator"></li>
                    <li class="b-sidebar__eventDisplayer">
                        <i class="material-icons">cake</i>
                        <span>
                            Événement<br />
                            <strong>{{ currentEvent.name }}</strong>
                        </span>
                    </li>
                    <li>
                        <router-link to="/stats" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">insert_chart</i>
                            Tableau de bord
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/purchases" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">shopping_cart</i>
                            Achats
                        </router-link>
                    </li>
                    <li v-if="currentEvent.usePeriods">
                        <router-link to="/periods" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">alarm</i>
                            Périodes
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/wikets" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">location_on</i>
                            Points de vente
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/participants" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">edit</i>
                            Privilèges
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/accesses" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">verified_user</i>
                            Accès
                        </router-link>
                    </li>
                    <li>
                        <router-link to="/alerts" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                            <i class="material-icons">add_alert</i>
                            Alertes
                        </router-link>
                    </li>
                </ul>
            </transition>
            <ul>
                <li class="b-sidebar__separator"></li>
                <li class="b-sidebar__eventDisplayer">
                    <i class="material-icons">settings</i>
                    <span>Avancé</span>
                </li>
                <li>
                    <router-link to="/giftreloads" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                        <i class="material-icons">card_giftcard</i>
                        Offres
                    </router-link>
                </li>
                <li>
                    <router-link to="/webservices" class="mdl-button mdl-button--accent mdl-js-button mdl-js-ripple-effect">
                        <i class="material-icons">call_made</i>
                        Webhooks
                    </router-link>
                </li>
            </ul>
        </div>
    </transition>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState({
            currentEvent: state => state.app.currentEvent
        }),

        ...mapGetters(['logged']),

        barName() {
            return config.name;
        }
    }
};
</script>

<style>
@import '../variables.css';

.b-sidebar {
    z-index: 10;
    background: var(--sidebarBackground);
    float: left;
    height: 100%;
    position: fixed;
    width: var(--sidebarWidth);
    overflow-y: auto;

    & > h1 {
        color: var(--sidebarColor);
        background-color: var(--titleBackgroundColor);
        font-size: var(--sidebarTitleSize);
        font-weight: var(--sidebarTitleWeight);
        padding: var(--sidebarTitlePadding);
        margin-top: 0px;
        margin-bottom: 10px;
        text-align: center;
    }

    & > ul {
        list-style: none;
        padding-left: 0;

        & > li {
            & > a {
                box-sizing: border-box;
                color: var(--sidebarColor) !important;
                display: inline-block;
                height: var(--sidebarLinkHeight);
                line-height: var(--sidebarLinkHeight);
                padding-left: 10px;
                text-align: left;
                text-decoration: none;
                width: 100%;

                & > i {
                    margin-right: 10px;
                }
            }
        }

        & > li:hover {
            background-color: lighten(var(--sidebarBackground), 10%);
        }

        & > .b-sidebar__separator {
            background-color: rgba(255, 255, 255, 0.9);
            height: 1px;
            width: 100%;
            width: calc(var(--sidebarWidth) - 80px);
            margin: auto;
        }

        & > .b-sidebar__eventDisplayer {
            color: var(--sidebarColor) !important;
            text-align: center;
            padding: 10px 5px 10px 5px;
            display: flex;
            align-items: center;

            & > i {
                margin-left: 3px;
                margin-right: 10px;
                font-size: 30px;
            }

            & > span {
                flex: 1;
                text-align: center;
                margin-left: -43px;

                & > strong {
                    font-size: 18px;
                }
            }
        }
    }
}

.b-sidebar + div + div {
    float: left;
    height: 100%;
    width: calc(100% - var(--sidebarWidth));
    margin-left: var(--sidebarWidth);
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.5s ease;
}

.slide-enter-active + .b-container,
.slide-leave-active + .b-container {
    transition: all 0.5s ease;
}

.slide-enter,
.slide-leave-active {
    margin-left: -200px;
}

.slide-enter + .b-container,
.slide-leave-active + .b-container {
    margin-left: 0;
    width: 100%;
}
</style>
