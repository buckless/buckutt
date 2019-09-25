<template>
    <div class="b-login">
        <img src="../../assets/logo.full.black.transparent.png" alt="Logo Buckless" />
        <b-modal title="Connexion" :closeButton="false" class="b-login-form">
            <form @submit.prevent="log(mail, password)" class="b-modal-form">
                <b-input label="Mail" v-model="mail" />
                <b-input label="Mot de passe" v-model="password" type="password" />
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <div class="b--flexspacer"></div>
                <b-button raised @click="log(mail, password)">Connexion</b-button>
            </template>
        </b-modal>
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
        ...mapActions(['login', 'notify']),

        log(mail, password) {
            this.login({ mail, password })
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

                    this.notify(message);
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

<style scoped>
.b-login {
    display: flex;
    flex-direction: column;
    margin: 0 !important;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

    & > img {
        margin-top: -255px;
        width: 300px;
        height: 135px;
        margin-bottom: 20px;
    }

    & > .b-login-form {
        width: 100%;
        max-width: 400px;
    }
}

.b-modal-form {
    & > label {
        margin-top: 15px;
        display: block;
    }
}
</style>
