<template>
    <div>
        <h5>Liste des équipements</h5>
        <div class="b-devices-options">
            <span>Type d'équipement:</span>
            <mdl-checkbox v-model="displayWiket">Point de vente</mdl-checkbox>
            <mdl-checkbox v-model="displayAdmin">Administrateur</mdl-checkbox>
        </div>

        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de l'équipement" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[
                { title: 'Équipement', field: 'name', object: true },
                { title: 'Équipement administrateur', field: 'isUser', type: 'checkbox' }
            ]"
            :data="displayedDevices"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="devices"
            :paging="10"
            @edit="editDevice"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            name: '',
            displayWiket: true,
            displayAdmin: true
        };
    },

    methods: {
        ...mapActions(['removeObject']),

        editDevice(device) {
            this.$router.push(`/devices/${device.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            devices: state => state.objects.devices
        }),
        displayedDevices() {
            return this.devices.filter(
                device =>
                    device.name !== 'manager' &&
                    device.name !== 'admin' &&
                    ((this.displayWiket && !device.isUser) || (this.displayAdmin && device.isUser))
            );
        }
    }
};
</script>

<style>
.b-devices-options {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    & > label {
        width: 150px;
        margin-left: 15px;
    }
}
</style>
