<template>
    <div>
        <h5>Modifier la fondation</h5>
        <form @submit.prevent="updateFundation(focusedFundation)">
            <mdl-textfield floating-label="Nom" :value="focusedFundation.name" @input="updateDeepestFocusedElement({ field: 'name', value: $event })" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield><br />
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

        updateFundation(fundation) {
            const fields = ['id', 'name'];
            this.updateObject({ route: 'fundations', value: pick(fundation, fields) })
                .then(() => this.notify({ message: 'La fondation a bien été modifiée' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification de la fondation',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedFundation: state => state.app.focusedElements[0]
        })
    }
};
</script>
