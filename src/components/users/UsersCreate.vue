<template>
    <div>
        <h5>Créer un utilisateur</h5>
        <form @submit.prevent="createUser(newUser)">
            <mdl-textfield floating-label="Nom" v-model="newUser.lastname" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
            <mdl-textfield floating-label="Prénom" v-model="newUser.firstname" required="required" error="Le prénom doit contenir au moins un caractère"></mdl-textfield><br />
            <mdl-textfield floating-label="Mail" v-model="newUser.mail" required="required" pattern="[^@\s]+@[^@\s]+\.[^@\s]+" error="L'adresse mail n'a pas le bon format"></mdl-textfield><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import bcrypt from 'bcryptjs';
import { mapActions } from 'vuex';
import { randString } from '../../lib/randString';

const randTen = () => Math.floor(Math.random() * 10);

export default {
    data() {
        return {
            newUser: {
                firstname: '',
                lastname: '',
                nickname: '',
                mail: '',
                credit: 0
            }
        };
    },

    methods: {
        ...mapActions(['createUserWithMol', 'updateCreationData', 'notify', 'notifyError']),

        createUser(user) {
            const newPin = `${randTen()}${randTen()}${randTen()}${randTen()}`;
            const newPassword = randString(8);

            user.pin = bcrypt.hashSync(newPin, 10);
            user.password = bcrypt.hashSync(newPassword);

            this.updateCreationData({
                pin: newPin,
                password: newPassword
            });

            this.createUserWithMol(user)
                .then(createdUser => {
                    this.notify({ message: "L'utilisateur a bien été créé" });
                    this.$router.push(`/users/${createdUser.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la création de l'utilisateur",
                        full: err
                    })
                );
        }
    }
};
</script>
