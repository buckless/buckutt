<template>
    <div>
        <h5>Historique des accès</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Utilisateur" v-model="user"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Heure d\'acces', field: 'clientTime', type: 'date' }, { title: 'Utilisateur', field: 'user' }, { title: 'Opérateur', field: 'operator' }, { title: 'Lieu', field: 'point' }]"
            :data="displayedAccesses"
            :filter="{ val: this.user, field: 'user' }"
            :sort="{ field: 'created_at', order: 'DESC' }"
            :paging="10">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            user: ''
        };
    },

    methods: {
        ...mapActions(['fetchObjectsAndRelations'])
    },

    computed: {
        ...mapState({
            accesses: state => state.objects.accesses
        }),

        displayedAccesses() {
            return this.accesses
                .filter(access => access.wiket && access.wiket.period)
                .map(access => ({
                    id: access.id,
                    clientTime: access.clientTime,
                    operator: `${access.operator.firstname} ${access.operator.lastname}`,
                    user: `${access.meanOfLogin.user.firstname} ${
                        access.meanOfLogin.user.lastname
                    }`,
                    point: access.wiket.point.name
                }));
        }
    },

    mounted() {
        this.fetchObjectsAndRelations({ route: 'accesses' });
    }
};
</script>
