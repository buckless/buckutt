<template>
    <div>
        <h5>Créer un équipement</h5>
        <form @submit.prevent="createDevice(newDevice)">
            <mdl-textfield floating-label="Nom" v-model="newDevice.name" required="required" error="Le nom doit contenir au moins un caractère"></mdl-textfield><br />
            <mdl-button colored raised>Créer</mdl-button>
        </form>
    </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
    data() {
        return {
            newDevice: {
                name: ''
            }
        };
    },

    methods: {
        ...mapActions(['createObject', 'notify', 'notifyError']),

        createDevice(device) {
            this.createObject({ route: 'devices', value: device })
                .then(createdDevice => {
                    this.notify({ message: "L'équipement a bien été créé" });
                    this.$router.push(`/devices/${createdDevice.id}`);
                })
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la création de l'équipement",
                        full: err
                    })
                );
        }
    }
};
</script>
