<template>
    <div class="b-staff">
        <h5>Staff</h5>
        <div class="b-staff__list">
            <b-staff v-for="user in staff" :key="user.id" :user="user"> </b-staff>
        </div>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import StaffTile from './StaffTile.vue';

export default {
    components: {
        'b-staff': StaffTile
    },

    methods: {
        ...mapActions(['fetchObjectsAndRelations'])
    },

    computed: {
        ...mapGetters(['staff'])
    },

    mounted() {
        this.fetchObjectsAndRelations({ route: 'rights' });
    }
};
</script>

<style>
.b-staff {
    & > .b-staff__list {
        display: flex;
        flex-wrap: wrap;
    }
}
</style>
