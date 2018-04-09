<template>
    <div>
        <h5>Identifiants de connexion</h5>
        <form @submit.prevent="createMol(focusedUser, newMol)">
            <mdl-textfield floating-label="Type" v-model="newMol.type" required="required" error="Le type doit contenir au moins un caractère"></mdl-textfield>
            <mdl-textfield floating-label="Contenu" v-model="newMol.data" required="required" error="Le contenu doit contenir au moins un caractère"></mdl-textfield><br />
            <mdl-button colored raised>Ajouter</mdl-button>
        </form>
        <br />
        <b-table
            :headers="[
                { title: 'Type', field: 'type' },
                { title: 'Contenu', field: 'data'}
            ]"
            :data="focusedUser.meansOfLogin"
            :actions="[
                { action: 'lock', text1: 'Bloquer', text2: 'Débloquer', field: 'blocked', type: 'reversible' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="meansOfLogin"
            :paging="10"
            @lock="lockMol"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

const molPattern = {
    type: null,
    data: null
};

export default {
    data() {
        return {
            newMol: Object.assign({}, molPattern)
        };
    },

    methods: {
        ...mapActions(['createObject', 'updateObject', 'removeObject', 'notify', 'notifyError']),

        createMol(user, meanOfLogin) {
            meanOfLogin.user_id = user.id;

            this.createObject({ route: 'meansOfLogin', value: meanOfLogin })
                .then(() => this.notify({ message: 'L`identifiant a bien été ajouté' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de l`ajout de l`équipement',
                        full: err
                    })
                );

            this.newMol = Object.assign({}, molPattern);
        },

        lockMol(meanOfLogin) {
            const modMol = {
                id: meanOfLogin.id,
                blocked: !meanOfLogin.blocked
            };

            this.updateObject({
                route: 'meansOfLogin',
                value: modMol
            })
                .then(() => this.notify({ message: 'L`identifiant a bien été modifié' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification de l`identifiant',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0]
        })
    }
};
</script>
