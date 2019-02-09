<template>
    <div>
        <h5>Modifier le webhook</h5>
        <form @submit.prevent="updateWebservice(focusedWebservice)">
            <mdl-textfield floating-label="Adresse" :value="focusedWebservice.url" @input="updateDeepestFocusedElement({ field: 'url', value: $event })" required="required" error="L'adresse' doit contenir au moins un caractère"></mdl-textfield><br />
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
        updateWebservice(webservice) {
            const fields = ['id', 'url'];
            this.updateObject({
                route: 'webservices',
                value: pick(webservice, fields)
            })
                .then(() => this.notify({ message: 'Le webhook a bien été modifiée' }))
                .catch(err =>
                    this.notifyError({
                        message: 'Une erreur a eu lieu lors de la modification du webhook',
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedWebservice: state => state.app.focusedElements[0]
        })
    }
};
</script>
