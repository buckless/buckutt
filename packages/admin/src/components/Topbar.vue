<template>
    <div class="b-topbar" v-if="logged">
        <div class="b--flexspacer">
            <b-global></b-global>
        </div>
        <div class="b-topbar__account">
            <div class="b-topbar__admin">
                <router-link :to="`/users/${loggedUser.id}`">
                    <b-icon name="account_circle" :size="36" />
                </router-link>
                <span class="b--capitalized" v-if="logged">{{ loggedUser.firstname }}</span>
            </div>
            <router-link to="/logout">
                <b-icon name="power_settings_new" :size="36" />
            </router-link>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import Global from './dashboard/DashboardGlobal.vue';

export default {
    components: {
        'b-global': Global
    },

    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser
        }),

        ...mapGetters(['logged', 'event'])
    }
};
</script>

<style scoped>
@import '../variables.css';

.b-topbar {
    z-index: 9;
    position: sticky;
    top: 0;
    background-color: white;
    height: 100px;
    width: 100%;
    display: flex;
    box-shadow: var(--elevation-4dp);

    & > .b-topbar__account {
        height: 100px;
        margin-left: 15px;
        padding-right: 23px;
        min-width: 170px;
        display: flex;
        align-items: center;

        & > .b-topbar__admin {
            display: flex;
            align-items: center;
            margin-right: 20px;

            & > span {
                font-size: 14px;
                margin-left: 5px;
                margin-right: 5px;
            }
        }

        & > a,
        & > .b-topbar__admin > a {
            color: #747474;
        }

        & > a:hover,
        & > .b-topbar__admin > a:hover {
            color: #222;
        }
    }
}
</style>
