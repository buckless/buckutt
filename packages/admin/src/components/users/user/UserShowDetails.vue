<template>
    <div>
        <h5>Détails de l'utilisateur</h5>
        <p v-if="creationData.pin">
            Le code PIN de l'utilisateur est <strong>{{ creationData.pin }}</strong>
        </p>
        <p v-if="creationData.password">
            Le mot de passe de l'utilisateur est <strong>{{ creationData.password }}</strong>
        </p>

        <b-list :elements="elements" :columns="2"></b-list>

        <template v-if="wallets.length > 0">
            <h5>Liste des supports</h5>
            <b-list :elements="wallets" :columns="3"></b-list>
        </template>

        <template v-if="event.useGroups && groups.length > 0">
            <h5>Résumé des groupes</h5>
            <b-list :elements="groups" :columns="3"></b-list>
        </template>

        <h5 v-if="rights.length > 0">Résumé des droits</h5>
        <template v-for="(rightPerPoint, index) in rights">
            <h6 v-if="rightPerPoint.point === 'Aucun'" :key="index">Droits de l'utilisateur</h6>
            <h6 v-else :key="index">
                Droits du participant sur le point {{ rightPerPoint.point }}
            </h6>
            <b-list :elements="rightPerPoint.rights" :columns="3" :key="`b-list-${index}`"></b-list>
        </template>
    </div>
</template>

<script>
import groupBy from 'lodash.groupby';
import { mapState, mapActions, mapGetters } from 'vuex';
import { parsePrice } from '../../../lib/price';

export default {
    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0],
            creationData: state => state.app.creationData
        }),

        ...mapGetters(['event']),

        elements() {
            const baseElements = [
                {
                    icon: 'person',
                    title: 'Nom',
                    content: this.focusedUser.lastname
                },
                {
                    icon: 'person',
                    title: 'Prénom',
                    content: this.focusedUser.firstname
                },
                {
                    icon: 'person',
                    title: 'Surnom',
                    content: this.focusedUser.nickname
                },
                {
                    icon: 'email',
                    title: 'Adresse mail',
                    content: this.focusedUser.mail
                }
            ];

            return baseElements;
        },

        filteredRights() {
            return (this.focusedUser.rights || []).map(right => {
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
                const rightPerPoint = {
                    point: groupedRights[key][0].point.name,
                    rights: []
                };

                groupedRights[key].forEach(right =>
                    rightPerPoint.rights.push({
                        icon: 'assignment_turned_in',
                        title: this.event.usePeriods ? `Période ${right.period.name}` : undefined,
                        content: right.name
                    })
                );

                rights.push(rightPerPoint);
            });

            return rights;
        },

        groups() {
            return (this.focusedUser.memberships || []).map(membership => ({
                icon: 'group',
                title: this.event.usePeriods ? `Période ${membership.period.name}` : undefined,
                content: (membership.group || {}).name
            }));
        },

        wallets() {
            return (this.focusedUser.wallets || []).map(wallet => ({
                icon: 'account_balance_wallet',
                title: `Support ${wallet.physical_id || wallet.logical_id || 'anonyme'}`,
                content: parsePrice(wallet.credit, true),
                url: `/wallets/${wallet.id}`
            }));
        }
    },

    methods: mapActions(['updateCreationData']),

    beforeDestroy() {
        this.updateCreationData({});
    }
};
</script>
