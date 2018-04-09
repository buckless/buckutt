<template>
    <div>
        <h5>Créer une catégorie</h5>
        <form @submit.prevent="createCategory(newCategory)">
            <mdl-textfield floating-label="Nom" v-model="newCategory.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
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
            newCategory: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createCategory(category) {
            this.createObject({ route: 'categories', value: category })
                .then(createdCategory => {
                    this.notify({ message: 'La catégorie a bien été créé' });
                    this.$router.push(`/categories/${createdCategory.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la création de la catégorie',
                        full: err
                    })
                );
        }
    }
};
</script>
