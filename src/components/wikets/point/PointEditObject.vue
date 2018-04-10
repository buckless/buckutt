<template>
    <div>
        <h5>Modifier le guichet {{ focusedPoint.name }}:</h5>
        <form @submit.prevent="updatePoint(focusedPoint)">
            <mdl-textfield floating-label="Nom" :value="focusedPoint.name" @input="updateDeepestFocusedElement({ field: 'name', value: $event })" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield><br />
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

        updatePoint(point) {
            const fields = ['id', 'name'];

            this.updateObject({ route: 'points', value: pick(point, fields) })
                .then(() => this.notify({ message: 'Le guichet a bien été modifié' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification du guichet',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedPoint: state => state.app.focusedElements[0]
        })
    }
};
</script>
