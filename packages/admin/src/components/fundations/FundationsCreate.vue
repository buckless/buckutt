<template>
    <div>
        <h5>Créer une fondation</h5>
        <form @submit.prevent="createFundation(newFundation)">
            <mdl-textfield
                floating-label="Nom"
                v-model="newFundation.name"
                required="required"
                error="Le nom doit contenir au moins un caractère"
            ></mdl-textfield>
            <br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newFundation: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createFundation(fundation) {
            this.createObject({ route: 'fundations', value: fundation })
                .then(createdFundation => {
                    this.notify({ message: 'La fondation a bien été créée' });
                    this.$router.push(`/fundations/${createdFundation.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la fondation',
                        full: err
                    })
                );
        }
    }
};
</script>
