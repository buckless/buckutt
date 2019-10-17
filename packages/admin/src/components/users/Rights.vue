<template>
    <div class="b-transactions">
        <b-pagination :rows="displayedRights" v-slot="{ rows }">
            <b-table :rows="rows" @action="startRemove" />
        </b-pagination>

        <div class="b-transactions-actions">
            <div class="b--flexspacer"></div>
            <b-button raised :to="`/users/${focusedElement.id}/rights/add`">Ajouter</b-button>
        </div>

        <b-confirm ref="confirm" @confirm="remove"></b-confirm>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

const translateRight = {
    admin: 'Administrateur',
    seller: 'Vendeur',
    reloader: 'Banquier',
    assigner: 'Opérateur de liaison de billets',
    controller: 'Opérateur de contrôle'
};

export default {
    data: () => ({
        rightId: ''
    }),

    computed: {
        ...mapGetters(['event', 'focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        },

        displayedRights() {
            return (this.focusedElement.rights || []).map(right => ({
                id: right.id,
                icon: 'assignment_turned_in',
                title: translateRight[right.name],
                subtitle:
                        right.period_id !== this.event.defaultPeriod_id && !this.event.usePeriods
                        ? `Point: ${this.pointName(right.point)} • Attention: une période autre que la période par défaut est utilisée`
                        : this.event.usePeriods
                        ? `Point: ${this.pointName(right.point)} • Période: ${right.period.name}`
                        : `Point: ${this.pointName(right.point)}`,
                rightIcon: 'delete'
            }));
        }
    },

    methods: {
        ...mapActions(['removeObject']),

        startRemove(rightId) {
            this.rightId = rightId;
            this.$refs.confirm.opened = true;
        },

        remove() {
            this.removeObject({ route: 'rights', value: { id: this.rightId } });
        },

        pointName(point) {
            return point ? point.name : 'Aucun';
        }
    }
};
</script>

<style scoped>
.b-transactions-actions {
    display: flex;
    margin-top: 15px;
}
</style>
