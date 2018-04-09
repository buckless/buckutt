<template>
    <div class="b-topbar" v-show="logged">
        <nav class="b-topbar__menu mdl-navigation">
            <template>
                <router-link to="/devices" class="mdl-navigation__link">
                    <i class="material-icons">devices</i><br />
                    Équipements
                </router-link>
                <router-link to="/points" class="mdl-navigation__link">
                    <i class="material-icons">view_comfy</i><br />
                    Guichets
                </router-link>
                <router-link to="/fundations" class="mdl-navigation__link">
                    <i class="material-icons">local_atm</i><br />
                    Fondations
                </router-link>
                <router-link to="/categories" class="mdl-navigation__link">
                    <i class="material-icons">format_list_numbered</i><br />
                    Catégories
                </router-link>
                <router-link to="/articles" class="mdl-navigation__link">
                    <i class="material-icons">free_breakfast</i><br />
                    Articles
                </router-link>
                <router-link to="/promotions" class="mdl-navigation__link">
                    <i class="material-icons">stars</i><br />
                    Formules
                </router-link>
                <router-link to="/users" class="mdl-navigation__link">
                    <i class="material-icons">person</i><br />
                    Utilisateurs
                </router-link>
                <router-link to="/groups" class="mdl-navigation__link">
                    <i class="material-icons">group</i><br />
                    Groupes
                </router-link>
            </template>
        </nav>
        <div class="b-topbar__account">
            <div class="b-topbar__admin">
                <router-link to="/account" class="mdl-navigation__link">
                    <i class="material-icons">account_circle</i>
                </router-link>
                <span class="b--capitalized" v-if="logged">{{ loggedUser.firstname }}</span>
            </div>
            <router-link to="/logout" class="mdl-navigation__link">
                <i class="material-icons">power_settings_new</i>
            </router-link>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser
        }),

        ...mapGetters(['logged'])
    }
};
</script>

<style>
@import '../variables.css';

.b-topbar {
    z-index: 9;
    position: fixed;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    background-color: white;
    height: 86px;
    width: 100%;
    padding-left: var(--sidebarWidth);

    & > .b-topbar__menu {
        flex: 1;
        margin-left: 15px;
        text-align: center;

        & > a:hover {
            color: black;
        }

        & > a {
            width: 90px;
            font-size: 14px;

            & > i {
                font-size: 35px;
            }
        }
    }

    & > .b-topbar__account {
        margin-left: 15px;
        padding-right: 23px;
        min-width: 170px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > .b-topbar__admin {
            display: flex;
            align-items: center;

            & > span {
                font-size: 14px;
                margin-left: 5px;
                margin-right: 5px;
            }
        }

        & > a,
        & > .b-topbar__admin > a {
            color: #222;

            & > i {
                font-size: 40px;
            }
        }

        & > a:hover,
        & > .b-topbar__admin > a:hover {
            color: black;
        }
    }
}
</style>
