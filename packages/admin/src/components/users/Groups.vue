<template>
    <div class="b-transactions">
        <b-pagination :rows="displayedMemberships" v-slot="{ rows }">
            <b-table :rows="rows" @action="startRemove" />
        </b-pagination>

        <div class="b-transactions-actions">
            <div class="b--flexspacer"></div>
            <b-button raised :to="`/${model}/${focusedElement.id}/groups/add`">Ajouter</b-button>
        </div>

        <b-confirm ref="confirm" @confirm="remove"></b-confirm>
        <router-view></router-view>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        model: {
            type: String,
            required: true
        }
    },

    data: () => ({
        membershipId: ''
    }),

    computed: {
        ...mapGetters(['event', 'focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        },

        displayedMemberships() {
            return (this.focusedElement.memberships || []).map(membership => ({
                id: membership.id,
                icon: 'group',
                title: membership.group.name,
                subtitle:
                    membership.period_id !== this.event.defaultPeriod_id && !this.event.usePeriods
                        ? 'Attention: une période autre que la période par défaut est utilisée'
                        : this.event.usePeriods
                        ? `Période: ${membership.period.name}`
                        : undefined,
                rightIcon: 'delete'
            }));
        }
    },

    methods: {
        ...mapActions(['removeObject']),

        startRemove(membershipId) {
            this.membershipId = membershipId;
            this.$refs.confirm.opened = true;
        },

        remove() {
            this.removeObject({ route: 'memberships', value: { id: this.membershipId } });
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
