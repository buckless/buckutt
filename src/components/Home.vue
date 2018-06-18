<template>
    <div class="b-home">
        <div class="mdc-card">
            <section class="b-home__tabs">
                <div class="b-home__tabs__tab" :class="tabConnect" @click="loginTab">Connexion</div>
                <div class="b-home__tabs__tab" :class="tabRegister" @click="registerTab">Inscription</div>
            </section>
            <router-view />
        </div>
    </div>
</template>

<script>
import { MDCTextField } from '@material/textfield/dist/mdc.textfield.min.js';
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        loginTab() {
            this.$router.push('/login');
        },

        registerTab() {
            this.$router.push('/register');
        }
    },

    computed: {
        tabConnect() {
            return this.$route.path === '/login' ? 'b-home__tabs__tab--active' : '';
        },

        tabRegister() {
            return this.$route.path.indexOf('/register') === 0 ? 'b-home__tabs__tab--active' : '';
        }
    }
};
</script>

<style lang="scss">
$mdc-theme-primary: #27ae60 !default;

.b-home__tabs {
    display: flex;
}

.b-home__tabs__tab {
    position: relative;
    flex: 1;
    padding: 16px 0;
    cursor: pointer;
    text-transform: uppercase;
    text-align: center;
    background-color: #dfdfdf;
}

.b-home__tabs__tab--active {
    color: $mdc-theme-primary;
    background-color: #fff;
}
</style>
