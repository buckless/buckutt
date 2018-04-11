<template>
    <div>
        <h5>Groupes</h5>
        <form @submit.prevent="addGroupToUser(focusedParticipant, membership)">
            <b-inputselect label="Groupe" id="group-select" :options="groupOptions" v-model="membership.group"></b-inputselect>
            <b-inputselect label="Période" id="period-select" :options="currentPeriodOptions" :fullOptions="periodOptions" v-model="membership.period" v-if="event.usePeriods"></b-inputselect><br />
            <mdl-button colored raised :disabled="disabledAdd">Ajouter</mdl-button>
        </form>
        <br />
        <b-table
            :headers="displayedColumns"
            :data="displayedMemberships"
            :actions="[
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="memberships"
            :paging="10"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';

const membershipPattern = {
    group: null,
    period: null
};

export default {
    data() {
        return {
            membership: Object.assign({}, membershipPattern)
        };
    },

    methods: {
        ...mapActions(['createObject', 'removeObject', 'notify', 'notifyError']),

        addGroupToUser(user, membership) {
            membership.period = this.event.usePeriods
                ? membership.period
                : this.event.defaultPeriod;

            const index = user.memberships.findIndex(
                m => m.group.id === membership.group.id && m.period.id === membership.period.id
            );

            if (index > -1) {
                return this.notifyError({
                    message: "L'utilisateur est déjà membre du groupe sur cette période."
                });
            }

            const newMembership = {
                group_id: membership.group.id,
                period_id: membership.period.id,
                user_id: user.id
            };

            this.createObject({
                route: 'memberships',
                value: newMembership
            })
                .then(() => this.notify({ message: "L'utilisateur a bien été ajouté au groupe" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'utilisateur",
                        full: err
                    })
                );

            this.membership = Object.assign({}, membershipPattern);
        }
    },

    computed: {
        ...mapState({
            focusedParticipant: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['groupOptions', 'currentPeriodOptions', 'periodOptions', 'event']),

        displayedColumns() {
            const columns = [{ title: 'Groupe', field: 'group.name' }];

            if (this.event.usePeriods) {
                columns.push({ title: 'Période', field: 'period.name' });
            }

            return columns;
        },

        displayedMemberships() {
            return (this.focusedParticipant.memberships || []).map(membership => {
                if (
                    membership.period.id !== this.event.defaultPeriod_id &&
                    !this.event.usePeriods
                ) {
                    membership.warning =
                        'Une période autre que<br />celle par défaut est utilisée.';
                }

                return membership;
            });
        },

        disabledAdd() {
            return !this.membership.group || (!this.membership.period && this.event.usePeriods);
        }
    }
};
</script>
