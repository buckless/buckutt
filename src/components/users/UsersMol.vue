<template>
    <div>
        <h5>Liste des utilisateurs</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Numéro du support NFC" v-model="mol" @input="search(mol)"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Utilisateur', field: 'fullname', class: 'b--capitalized', object: true, replaceAppendBy: '/users/' }]"
            :data="displayedUsers"
            :sort="{ field: 'firstname', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier', raised: true, colored: true },
                { action: 'removeUser', text: 'Supprimer', type: 'confirm' }
            ]"
            route="users"
            :paging="10"
            @edit="editUser"
            @removeUser="removeUserAndMols">
        </b-table>
    </div>
</template>

<script>
import debounce from 'lodash.debounce';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            mol: ''
        };
    },

    methods: {
        ...mapActions(['searchMols', 'clearObject', 'removeUserAndMols']),

        editUser(user) {
            this.$router.push(`/users/${user.id}/edit`);
        },

        search(mol) {
            this.searchMols({ mol });
        }
    },

    computed: {
        ...mapState({
            users: state => state.objects.users
        }),

        displayedUsers() {
            return this.users.map(user => {
                user.fullname = `${user.firstname} ${user.lastname}`;
                return user;
            });
        }
    },

    mounted() {
        this.search('');
        const search = this.search;
        this.search = debounce(mol => search(mol), 500);
    },

    destroyed() {
        this.clearObject('users');
    }
};
</script>
