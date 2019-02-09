<template>
    <div>
        <h5>Modifier le groupe {{ focusedGroup.name }}:</h5>
        <form @submit.prevent="updateGroup(focusedGroup)">
            <mdl-textfield
                floating-label="Nom"
                :value="focusedGroup.name"
                @input="updateDeepestFocusedElement({ field: 'name', value: $event })"
                required="required"
                error="Le nom doit contenir au moins un caractère"
            ></mdl-textfield
            ><br />
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

        updateGroup(group) {
            const fields = ['id', 'name'];

            this.updateObject({ route: 'groups', value: pick(group, fields) })
                .then(() => this.notify({ message: 'Le groupe a bien été modifié' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification du groupe',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedGroup: state => state.app.focusedElements[0]
        })
    }
};
</script>
