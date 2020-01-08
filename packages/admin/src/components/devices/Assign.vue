<template>
    <div class="b-assign">
        <p>
            <strong>Note:</strong> Si deux périodes se chevauchent, la période ayant la durée la
            plus courte sera choisie.
        </p>
        <b-pagination :rows="displayedWikets" v-slot="{ rows }">
            <b-table :rows="rows" @action="startRemove" />
        </b-pagination>

        <div class="b-assign-actions">
            <div class="b--flexspacer"></div>
            <b-button raised :to="`/${model}/${focusedElement.id}/assign/add`">Ajouter</b-button>
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
        wiketId: ''
    }),

    computed: {
        ...mapGetters(['event', 'focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        },

        displayedWikets() {
            return (this.focusedElement.wikets || []).map(wiket => ({
                id: wiket.id,
                icon: 'group',
                title: wiket.point.name,
                subtitle: `${
                    this.event.useGroups
                        ? `Prix à afficher: groupe ${wiket.defaultGroup.name} ꞏ`
                        : ''
                }
                    ${
                        wiket.period_id !== this.event.defaultPeriod_id && !this.event.usePeriods
                            ? 'Attention: une période autre que la période par défaut est utilisée'
                            : this.event.usePeriods
                            ? `Période: ${wiket.period.name}`
                            : ''
                    }`,
                rightIcon: 'delete'
            }));
        }
    },

    methods: {
        ...mapActions(['removeObject', 'notify']),

        startRemove(wiketId) {
            this.wiketId = wiketId;
            this.$refs.confirm.opened = true;
        },

        async remove() {
            try {
                await this.removeObject({ route: 'wikets', value: { id: this.wiketId } });
                this.notify('Le guichet a bien été supprimé');
            } catch {
                this.notify('Il y a eu une erreur lors de la suppression du guichet');
            }
        }
    }
};
</script>

<style scoped>
.b-assign-actions {
    display: flex;
    margin-top: 15px;
}
</style>
