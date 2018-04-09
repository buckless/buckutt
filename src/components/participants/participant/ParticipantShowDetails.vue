<template>
    <div>
        <template v-if="!currentEvent.useGroups">
            <h5>Accès à l'événement</h5>
            <p v-if="isInDefaultGroup">
                Cet utilisateur participe à l'événement sélectionné.<br />
                <mdl-button @click.native="removeMembership(isInDefaultGroup)">Interdire l'accès</mdl-button>
            </p>
            <p v-else>
                Cet utilisateur ne participe pas à l'événement sélectionné.<br />
                <mdl-button @click.native="addUserToGroup(focusedParticipant, currentEvent.defaultGroup, currentEvent.defaultPeriod)">Accorder l'accès</mdl-button>
            </p>
        </template>
        <template v-else>
            <h5>Résumé des groupes pour l'événement</h5>
            <template v-if="groups.length > 0">
                <b-list :elements="groups" :columns="3"></b-list>
                <p v-if="isInDefaultGroup">Ce participant est dans le groupe par défaut de l'événement.</p>
            </template>
            <p v-else>
                Cet utilsateur n'appartient à aucun groupe de l'événement, il ne participe donc pas à l'événement.<br />
                <mdl-button @click.native="addUserToGroup(focusedParticipant, currentEvent.defaultGroup, currentEvent.defaultPeriod)">Ajouter au groupe</mdl-button>
            </p>
        </template>

        <h5 v-if="rights.length > 0">Résumé des droits pour l'événement</h5>
        <template v-for="rightPerPoint in rights">
            <h6 v-if="rightPerPoint.point === 'Aucun'">Droits du partipant</h6>
            <h6 v-else>Droits du participant sur le point {{ rightPerPoint.point }}</h6>
            <b-list :elements="rightPerPoint.rights" :columns="3"></b-list>
        </template>
    </div>
</template>

<script>
import groupBy from 'lodash.groupby';
import { mapState, mapActions } from 'vuex';
import { isUserInGroup } from './isUserInGroup';

export default {
    computed: {
        ...mapState({
            focusedParticipant: state => state.app.focusedElements[0],
            currentEvent: state => state.app.currentEvent
        }),

        filteredRights() {
            return (this.focusedParticipant.rights || [])
                .filter(right => right.period.event_id === this.currentEvent.id)
                .map(right => {
                    if (!right.point) {
                        right.point = { id: '0', name: 'Aucun' };
                    }
                    return right;
                });
        },

        rights() {
            const rights = [];
            const groupedRights = groupBy(this.filteredRights, 'point.id');

            Object.keys(groupedRights).forEach(key => {
                const rightPerPoint = { point: groupedRights[key][0].point.name, rights: [] };

                groupedRights[key].forEach(right =>
                    rightPerPoint.rights.push({
                        icon: 'assignment_turned_in',
                        title: this.currentEvent.usePeriods
                            ? `Période ${right.period.name}`
                            : undefined,
                        content: right.name
                    })
                );

                rights.push(rightPerPoint);
            });

            return rights;
        },

        groups() {
            return (this.focusedParticipant.memberships || [])
                .filter(membership => membership.period.event_id === this.currentEvent.id)
                .map(membership => ({
                    icon: 'group',
                    title: this.currentEvent.usePeriods
                        ? `Période ${membership.period.name}`
                        : undefined,
                    content: (membership.group || {}).name
                }));
        },

        isInDefaultGroup() {
            const group = this.currentEvent.defaultGroup;
            const period = this.currentEvent.defaultPeriod;

            return isUserInGroup(this.focusedParticipant, group, period);
        }
    },

    methods: {
        ...mapActions(['createObject', 'removeObject', 'notify', 'notifyError']),

        addUserToGroup(user, group, period) {
            const newMembership = {
                user_id: user.id,
                period_id: period.id,
                group_id: group.id
            };

            this.createObject({
                route: 'memberships',
                value: newMembership
            })
                .then(() => this.notify({ message: "L'utilisateur a bien été autorisé" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'utilisateur",
                        full: err
                    })
                );
        },
        removeMembership(membership) {
            this.removeObject({
                route: 'memberships',
                value: membership
            })
                .then(() => this.notify({ message: "L'utilisateur a bien été interdit" }))
                .catch(err =>
                    this.notifyError({
                        message: "Une erreur a eu lieu lors de la modification de l'utilisateur",
                        full: err
                    })
                );
        }
    }
};
</script>
