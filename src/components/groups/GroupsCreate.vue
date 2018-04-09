<template>
    <div>
        <h5>Créer un groupe </h5>
        <form @submit.prevent="createGroup(newGroup)">
            <mdl-textfield floating-label="Nom" v-model="newGroup.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newGroup: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createGroup(group) {
            this.createObject({ route: 'groups', value: group })
                .then(createdGroup => {
                    this.notify({ message: 'Le groupe a bien été créé' });
                    this.$router.push(`/groups/${createdGroup.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création du groupe',
                        full: err
                    })
                );
        }
    }
};
</script>
