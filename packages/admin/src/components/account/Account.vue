<template>
    <div class="b-account b-page">
        <div class="mdl-card mdl-shadow--2dp">
            <b-navbar title="Mon compte" :inCard="true"></b-navbar>
            <h5>Modifier le mot de passe administrateur</h5>
            <form @submit.prevent="changePassword(loggedUser, newPassword, confirmation)">
                <mdl-textfield
                    type="password"
                    floating-label="Nouveau mot de passe"
                    v-model="newPassword"
                    required="required"
                    error="Le mot de passe doit contenir au moins un caractère"
                ></mdl-textfield>
                <mdl-textfield
                    type="password"
                    floating-label="Confirmation"
                    v-model="confirmation"
                    required="required"
                    error="Le mot de passe doit contenir au moins un caractère"
                ></mdl-textfield
                ><br />
                <mdl-button colored raised>Valider</mdl-button>
            </form>
        </div>
    </div>
</template>

<script>
import bcrypt from 'bcryptjs';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            newPassword: '',
            confirmation: ''
        };
    },

    methods: {
        ...mapActions(['updateObject', 'notify', 'notifyError']),

        changePassword(user, newPassword, confirmation) {
            if (newPassword !== confirmation) {
                return this.notifyError({
                    message: 'Les deux mots de passe ne sont pas identiques'
                });
            }

            this.updateObject({
                route: 'users',
                value: {
                    id: user.id,
                    password: bcrypt.hashSync(newPassword, 10)
                }
            })
                .then(this.notify({ message: 'Le mot de passe a bien été modifié' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification du mot de passe',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            loggedUser: state => state.app.loggedUser
        })
    }
};
</script>
