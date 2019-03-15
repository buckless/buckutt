<template>
    <div>
        <h5>Détails du support</h5>
        <b-list :elements="elements" :columns="2"></b-list>

        <template v-if="!event.useGroups">
            <h5>Résumé des groupes du support</h5>
            <template v-if="groups.length > 0">
                <b-list :elements="groups" :columns="3"></b-list>
            </template>
        </template>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';

export default {
    computed: {
        ...mapState({
            focusedWallet: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['event']),

        elements() {
            const baseElements = [
                {
                    icon: 'person',
                    title: 'Id physique',
                    content: this.focusedWallet.physical_id || 'Aucun'
                },
                {
                    icon: 'person',
                    title: 'Id logique',
                    content: this.focusedWallet.logical_id || 'Aucun'
                },
                {
                    icon: 'person',
                    title: 'Utilisateur associé',
                    content: this.focusedWallet.user
                        ? `${this.focusedWallet.user.firstname} ${this.focusedWallet.user.lastname}`
                        : 'Aucun',
                    url: this.focusedWallet.user ? `/users/${this.focusedWallet.user.id}` : null
                },
                {
                    icon: 'email',
                    title: 'Ticket associé',
                    content: this.focusedWallet.ticket ? this.focusedWallet.physical_id : 'Aucun'
                },
                {
                    icon: 'attach_money',
                    type: 'price',
                    title: 'Solde',
                    content: this.focusedWallet.credit
                },
                {
                    icon: 'attach_money',
                    type: 'price',
                    title: 'Écritures en attente',
                    content: this.sumPcu
                }
            ];

            return baseElements;
        },

        groups() {
            return (this.focusedWallet.memberships || []).map(membership => ({
                icon: 'group',
                title: this.event.usePeriods ? `Période ${membership.period.name}` : undefined,
                content: (membership.group || {}).name
            }));
        },

        sumPcu() {
            return (this.focusedWallet.pendingCardUpdates || []).reduce(
                (a, pcu) => a + pcu.amount,
                0
            );
        }
    }
};
</script>
