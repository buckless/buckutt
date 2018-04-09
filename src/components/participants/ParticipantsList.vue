<template>
    <div>
        <h5>Liste des utilisateurs</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Nom ou Prénom de l'utilisateur" v-model="userName" @input="search(userName)"></mdl-textfield>
            <i class="material-icons" id="usertip">info</i>
            <mdl-tooltip target="usertip">En dessous de 3 caractères, seule la première page est affichée.</mdl-tooltip>
        </div>

        <b-table
            :headers="[{ title: 'Utilisateur', field: 'fullname', class: 'b--capitalized', object: true }]"
            :data="displayedUsers"
            :sort="{ field: 'firstname', order: 'ASC' }"
            route="users"
            :paging="10"
            @pagingChanged="pagingChanged">
        </b-table>
    </div>
</template>

<script>
import debounce from 'lodash.debounce';
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            userName: '',
            minResults: 10
        };
    },

    methods: {
        ...mapActions(['searchUsers', 'clearObject', 'removeObject']),

        pagingChanged(paging) {
            this.minResults = paging;
            this.searchUsers({ name: this.userName, min: this.minResults });
        },

        search(name) {
            this.searchUsers({ name, min: this.minResults });
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
        this.search = debounce(name => search(name), 500);
    },

    destroyed() {
        this.clearObject('users');
    }
};
</script>
