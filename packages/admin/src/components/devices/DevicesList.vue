<template>
    <div>
        <h5>Liste des équipements associés</h5>

        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom de l'équipement" v-model="name"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Équipement', field: 'name', object: true }]"
            :data="authorizedDevices"
            :filter="{ val: this.name, field: 'name' }"
            :sort="{ field: 'name', order: 'ASC' }"
            :actions="[
                { action: 'associate', text: 'Ré-associer' },
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="devices"
            :paging="10"
            @associate="associateDevice"
            @edit="editDevice"
            @remove="removeObject"
        >
        </b-table>

        <template v-if="unauthorizedDevices.length > 0">
            <h5>Liste des équipements à associer</h5>

            <b-table
                :headers="[{ title: 'Équipement', field: 'name', object: true }]"
                :data="unauthorizedDevices"
                :sort="{ field: 'name', order: 'ASC' }"
                :actions="[
                    { action: 'associate', text: 'Associer' },
                    { action: 'edit', text: 'Modifier' },
                    { action: 'remove', text: 'Supprimer', type: 'confirm' }
                ]"
                route="devices"
                :paging="10"
                @associate="associateDevice"
                @edit="editDevice"
                @remove="removeObject"
            >
            </b-table>
        </template>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            name: ''
        };
    },

    methods: {
        ...mapActions(['updateObject', 'removeObject', 'notify', 'notifyError']),

        editDevice(device) {
            this.$router.push(`/devices/${device.id}/edit`);
        },

        associateDevice(device) {
            this.updateObject({
                route: 'devices',
                value: {
                    id: device.id,
                    authorized: true,
                    sendPrivateKey: true
                }
            })
                .then(() => this.notify({ message: "L'équipement a bien été associé" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de l'association de l'équipement",
                        full: err
                    })
                );
        }
    },

    computed: {
        ...mapState({
            devices: state => state.objects.devices
        }),

        displayedDevices() {
            return this.devices.filter(
                device => device.name !== 'manager' && device.name !== 'admin'
            );
        },

        authorizedDevices() {
            return this.displayedDevices.filter(device => device.authorized);
        },

        unauthorizedDevices() {
            return this.displayedDevices.filter(device => !device.authorized);
        }
    }
};
</script>
