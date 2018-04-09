<template>
    <div>
        <h5>Modifier la catégorie {{ focusedCategory.name }}:</h5>
        <form @submit.prevent="updateCategory(focusedCategory)">
            <mdl-textfield floating-label="Nom" :value="focusedCategory.name" @input="updateDeepestFocusedElement({ field: 'name', value: $event })" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>
            <br />
            <mdl-button colored raised>Modifier</mdl-button>
        </form>
    </div>
</template>

<script>
import pick from 'lodash.pick';
import { mapState, mapActions } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateObject', 'updateDeepestFocusedElement', 'notify', 'notifyError']),

        updateCategory(category) {
            const fields = ['id', 'name'];

            this.updateObject({ route: 'categories', value: pick(category, fields) })
                .then(() => this.notify({ message: 'La catégorie a bien été modifiée' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification de la catégorie',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedCategory: state => state.app.focusedElements[0]
        })
    }
};
</script>
