<template>
    <div>
        <h5>Modifier la formule {{ focusedPromotion.name }}:</h5>
        <form @submit.prevent="updatePromotion(focusedPromotion)">
            <mdl-textfield
                floating-label="Nom"
                :value="focusedPromotion.name"
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

        updatePromotion(promotion) {
            const fields = ['id', 'name'];

            this.updateObject({ route: 'promotions', value: pick(promotion, fields) })
                .then(() => this.notify({ message: 'La formule a bien été modifiée' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification de la formule',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedPromotion: state => state.app.focusedElements[0]
        })
    }
};
</script>
