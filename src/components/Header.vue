<template>
    <header class="b-header" :class="headerClass">
        <h1>{{ barName }}</h1>
        <div class="b-header__credit" v-if="loggedUser">
            Mon solde :<br/>
            <div>
                {{ loggedUser.credit | price(true) }}
            </div>
            <div class="b-header__credit__pending" v-if="pending">
                <i class="material-icons">hourglass_empty</i> {{ pending | price(true) }} en attente
            </div>
        </div>
        <router-link to="/logout" class="b-header__logout" v-if="loggedUser">
            <i class="material-icons">power_settings_new</i>
        </router-link>

        <b-switcher v-if="loggedUser" />

        <nav class="b-header__navigation" v-if="loggedUser">
            <router-link to="/reload" :class="reloadClass">
                <i class="material-icons">attach_money</i>
                <div>Recharger</div>
            </router-link>
            <div class="b-header__navigation__separator"></div>
            <router-link to="/history" :class="historyClass">
                <i class="material-icons">history</i>
                <div>Historique</div>
            </router-link>
            <div class="b-header__navigation__separator"></div>
            <router-link to="/transfer" :class="transferClass">
                <i class="material-icons">swap_horiz</i>
                <div>Virement</div>
            </router-link>
            <div class="b-header__navigation__separator"></div>
            <router-link to="/account" :class="accountClass">
                <i class="material-icons">person</i>
                <div>Mon compte</div>
            </router-link>
        </nav>
    </header>
</template>

<script>
import Switcher from './Switcher';
import { mapState } from 'vuex';

export default {
    components: {
        'b-switcher': Switcher
    },

    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser,
            pending: state => state.app.pending,
            logged: state => !!state.app.loggedUser
        }),

        headerClass() {
            return this.loggedUser ? 'b-header--logged' : '';
        },

        barName() {
            return process.env.name;
        },

        historyClass() {
            return this.$route.path === '/history' ? { 'b--active': true } : null;
        },

        reloadClass() {
            return this.$route.path === '/reload' ? { 'b--active': true } : null;
        },

        accountClass() {
            return this.$route.path === '/account' ? { 'b--active': true } : null;
        },

        transferClass() {
            return this.$route.path === '/transfer' ? { 'b--active': true } : null;
        }
    }
};
</script>

<style lang="scss">
$header-color: #34495e !default;

.b-header {
    background-color: $header-color;
    position: relative;

    &.b-header--logged {
        padding-bottom: 1rem;
    }

    & > h1 {
        color: #fff;
        font-size: 2.5rem;
        font-weight: 300;
        padding: 1rem 0;
        margin: 0;
        text-align: center;
    }

    & > .b-header__credit {
        color: #fff;
        text-align: center;

        & > div {
            font-size: 4rem;
            line-height: 4rem;
            margin-bottom: 2rem;
            margin-top: 0.5rem;
        }

        & > .b-header__credit__pending {
            font-size: 1rem;
            margin-bottom: 0.5rem;
            display: flex;
            margin-top: -3rem;
            align-items: center;
            justify-content: center;

            & > i {
                margin-right: 5px;
                font-size: 1.5rem !important;
            }
        }
    }

    & .b-header__logout {
        color: #fff;
        cursor: pointer;
        height: 32px;
        position: absolute;
        right: 10px;
        top: 10px;

        & > i {
            font-size: 2rem;
        }
    }

    & .b-header__navigation {
        display: flex;
        justify-content: center;

        & > a {
            text-decoration: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            color: rgba(255, 255, 255, 0.6);
            padding: 0 1rem;
            min-width: 100px;

            &:hover {
                background-color: transparent;
            }

            &.b--active {
                color: #fff;
                font-weight: 500;
            }

            & > i {
                display: block;
                font-size: 2rem;
                margin-bottom: 5px;
            }

            & > div {
                text-transform: uppercase;
                text-align: center;
                font-size: 0.8rem;
            }
        }
    }
}

.b-header__navigation__separator {
    background-color: rgba(255, 255, 255, 0.3);
    width: 1px;
}

@media (max-width: 450px) {
    .b-header__navigation {
        transform: scale(0.8);
    }

    .b-header .b-header__navigation > a {
        padding: 0 1rem;
        min-width: 50px;

        &:not(:last-child) {
            margin-right: 10px;
        }
    }

    .b-header__navigation__separator {
        display: none;
    }
}
</style>
