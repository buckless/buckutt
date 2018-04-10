<template>
    <div class="b-container" :class="{ 'b-container__display': !logged }">
        <div class="b-container__login">
            <div class="mdl-card mdl-shadow--2dp">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">Connexion</h2>
                </div>
                <form @submit.prevent="log(mail, password)">
                    <div class="mdl-card__supporting-text">
                        <mdl-textfield floating-label="Mail" v-model="mail" required></mdl-textfield><br />
                        <mdl-textfield type="password" floating-label="Mot de passe" v-model="password" required></mdl-textfield>
                    </div>
                    <div class="mdl-card__actions mdl-card--border">
                        <mdl-button colored>Connexion</mdl-button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

export default {
    data() {
        return {
            mail: null,
            password: null
        };
    },

    methods: {
        ...mapActions(['login', 'notifyError']),

        log(mail, password) {
            this.login({ meanOfLogin: config.defaultMol, data: mail, password })
                .then(() => this.$router.push('/stats'))
                .catch(err => {
                    let message;
                    switch (err.message) {
                        case 'You are not administrator':
                            message = "Vous n'êtes pas administrateur";
                            break;
                        case 'Not Found':
                            message = 'Utilisateur introuvable';
                            break;
                        case 'Unauthorized':
                            message = "Vous n'êtes pas autorisé à vous connecter";
                            break;
                        default:
                            message = 'Erreur inconnue';
                    }

                    this.notifyError({ message, full: err });
                });
        }
    },

    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser
        }),

        ...mapGetters(['logged'])
    },

    mounted() {
        if (this.logged) {
            this.$router.push('/stats');
        }
    }
};
</script>

<style>
@import '../../variables.css';

.b-container {
    &.b-container__display {
        margin-left: 0 !important;
        width: 100% !important;
    }

    & .mdl-snackbar {
        margin-left: calc(var(--sidebarWidth) / 2);
    }
}

.b-container__login {
    & > div {
        width: 500px;
        margin: 50px auto -50px auto;

        & .mdl-textfield {
            width: 100%;
        }
    }
}
</style>
