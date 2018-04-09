<template>
    <div>
        <h5>Modifier l'équipement {{ focusedDevice.name }}</h5>
        <form @submit.prevent="updateDevice(focusedDevice)">
            <mdl-textfield floating-label="Nom" :value="focusedDevice.name" @input="updateDeepestFocusedElement({ field: 'name', value: $event })" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield>

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

        updateDevice(device) {
            const fields = ['id', 'name'];

            this.updateObject({ route: 'devices', value: pick(device, fields) })
                .then(() => this.notify({ message: "L'équipement a bien été modifié" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'équipement",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            focusedDevice: state => state.app.focusedElements[0]
        })
    }
};
</script>
