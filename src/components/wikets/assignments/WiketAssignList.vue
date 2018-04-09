<template>
    <div>
        <h5>Équipements</h5>
        <form @submit.prevent="createWiket(wiket)">
            <b-inputselect label="Équipement" id="device-select" :options="deviceOptions" v-model="wiket.device"></b-inputselect>
            <b-inputselect label="Période" id="period-select" :options="currentPeriodOptions" :fullOptions="periodOptions" v-model="wiket.period" v-if="currentEvent.usePeriods"></b-inputselect>
            <b-inputselect label="Groupe par défaut" id="group-select" :options="groupOptions" v-model="wiket.defaultGroup" v-if="currentEvent.useGroups"></b-inputselect>
            <mdl-button colored raised :disabled="disabledAdd">Ajouter</mdl-button>
        </form>
        <b-table
            :headers="displayedColumns"
            :data="displayedWikets"
            :actions="[
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="wikets"
            :paging="5"
            @remove="removeObject">
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex';
import { isPointUsedByEvent } from './isPointUsedByEvent';

const wiketPattern = {
    device: null,
    period: null,
    point: null,
    defaultGroup: null
};

export default {
    data() {
        return {
            wiket: Object.assign({}, wiketPattern)
        };
    },

    methods: {
        ...mapActions(['createObject', 'removeObject', 'notify', 'notifyError']),

        createWiket(wiket) {
            wiket.point = this.focusedPoint;
            wiket.period = this.currentEvent.usePeriods
                ? wiket.period
                : this.currentEvent.defaultPeriod;
            wiket.defaultPeriod = this.currentEvent.useGroups
                ? wiket.defaultGroup
                : this.currentEvent.defaultGroup;

            if (isPointUsedByEvent(this.focusedPoint.wikets, wiket)) {
                return this.notifyError({
                    message:
                        'Le guichet est déjà utilisé par un autre événement pendant cette période'
                });
            }

            const newWiket = {
                point_id: wiket.point.id,
                device_id: wiket.device.id,
                period_id: wiket.period.id,
                defaultGroup_id: wiket.defaultGroup.id
            };

            this.createObject({
                route: 'wikets',
                value: newWiket
            })
                .then(() => {
                    this.wiket = Object.assign({}, wiketPattern);
                    this.notify({ message: "L'équipement a bien été assigné au point" });
                })
                .catch(err =>
                    this.notifyError({
                        message: "L'équipement n'a pas pu être assigné au point",
                        full: err
                    })
                );
        }
    },
    computed: {
        ...mapState({
            currentEvent: state => state.app.currentEvent,
            focusedPoint: state => state.app.focusedElements[0]
        }),

        ...mapGetters(['periodOptions', 'currentPeriodOptions', 'deviceOptions', 'groupOptions']),

        displayedColumns() {
            const columns = [{ title: 'Équipement', field: 'device.name' }];

            if (this.currentEvent.usePeriods) {
                columns.push({ title: 'Période', field: 'period.name' });
            }

            if (this.currentEvent.useGroups) {
                columns.push({ title: 'Groupe par défaut', field: 'defaultGroup.name' });
            }

            return columns;
        },

        displayedWikets() {
            return (this.focusedPoint.wikets || [])
                .filter(wiket => wiket.period.event_id === this.currentEvent.id)
                .map(wiket => {
                    if (
                        wiket.period.id !== this.currentEvent.defaultPeriod_id &&
                        !this.currentEvent.usePeriods
                    ) {
                        wiket.warning = 'Une période autre que<br />celle par défaut est utilisée.';
                    }

                    if (
                        wiket.defaultGroup.id !== this.currentEvent.defaultGroup_id &&
                        !this.currentEvent.useGroups
                    ) {
                        wiket.warning =
                            'Un groupe par défaut autre que<br />celui de l`événement est utilisé.';
                    }

                    return wiket;
                });
        },

        disabledAdd() {
            return (
                (!this.wiket.period && this.currentEvent.usePeriods) ||
                (!this.wiket.defaultGroup && this.currentEvent.useGroups) ||
                !this.wiket.device
            );
        }
    },

    mounted() {
        if (this.focusedPoint.defaultGroup) {
            this.wiket.defaultGroup = this.focusedPoint.defaultGroup;
        }
    }
};
</script>
