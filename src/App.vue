<template>
    <div class="mdl-layout mdl-js-layout">
        <b-header />
        <main class="mdl-layout__content" :class="{ 'b-forcedMain': !logged }">
            <router-view></router-view>
            <footer class="b-cgu">&copy; Studio Async — <a href="https://buckless.com/static/cgu.pdf">Conditions</a></footer>
        </main>

        <div class="mdc-snackbar"
             aria-live="assertive"
             aria-atomic="true"
             aria-hidden="true"
             ref="snackbar">
          <div class="mdc-snackbar__text"></div>
          <div class="mdc-snackbar__action-wrapper">
            <button type="button" class="mdc-snackbar__action-button"></button>
          </div>
        </div>
    </div>
</template>

<script>
import { MDCSnackbar } from '@material/snackbar/dist/mdc.snackbar.min.js';
import { mapState } from 'vuex';
import Header from './components/Header.vue';

export default {
    components: {
        'b-header': Header
    },

    computed: {
        ...mapState({
            logged: state => !!state.app.loggedUser
        })
    },

    mounted() {
        const snackbar = MDCSnackbar.attachTo(this.$refs.snackbar);

        this.$store.subscribe(mutation => {
            switch (mutation.type) {
                case 'UPDATENOTIFY':
                    snackbar.show({
                        message: mutation.payload.message,
                        timeout: 3000
                    });
                    break;
                default:
                    break;
            }
        });
    }
};
</script>

<style lang="scss">
$mdc-theme-primary: #27ae60 !default;

@import '@material/ripple/mdc-ripple.scss';
@import '@material/list/mdc-list.scss';
@import '@material/button/mdc-button.scss';
@import '@material/card/mdc-card.scss';
@import '@material/textfield/mdc-text-field.scss';
@import '@material/snackbar/mdc-snackbar.scss';
@import '@material/checkbox/mdc-checkbox.scss';
@import '@material/menu/mdc-menu.scss';
@import './main.css';
</style>

<style>
main.mdl-layout__content {
    overflow: visible;
}

.b-forcedMain {
    width: 100%;
    margin-left: 0px !important;
}

footer {
    text-align: center;
    color: #757575;
    font-size: 14px;
    margin-bottom: 24px;
    font-weight: bold;
    opacity: 0.7;
}

footer > a {
    color: #757575;
}
</style>
