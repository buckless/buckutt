<template>
    <div>
        <h5>Équipements</h5>
        <form @submit.prevent="createWiket(wiket)">
            <b-inputselect label="Équipement" id="device-select" :options="deviceOptions" v-model="wiket.device"></b-inputselect>
            <b-inputselect label="Période" id="period-select" :options="currentPeriodOptions" :fullOptions="periodOptions" v-model="wiket.period" v-if="event.usePeriods"></b-inputselect>
            <b-inputselect label="Groupe par défaut" id="group-select" :options="groupOptions" v-model="wiket.defaultGroup" v-if="event.useGroups"></b-inputselect>
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
            wiket.period = this.event.usePeriods ? wiket.period : this.event.defaultPeriod;
            wiket.defaultGroup = this.event.useGroups
                ? wiket.defaultGroup
                : this.event.defaultGroup;

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
            focusedPoint: state => state.app.focusedElements[0]
        }),

        ...mapGetters([
            'periodOptions',
            'currentPeriodOptions',
            'deviceOptions',
            'groupOptions',
            'event'
        ]),

        displayedColumns() {
            const columns = [{ title: 'Équipement', field: 'device.name' }];

            if (this.event.usePeriods) {
                columns.push({ title: 'Période', field: 'period.name' });
            }

            if (this.event.useGroups) {
                columns.push({
                    title: 'Groupe par défaut',
                    field: 'defaultGroup.name'
                });
            }

            return columns;
        },

        displayedWikets() {
            return (this.focusedPoint.wikets || []).map(wiket => {
                if (wiket.period.id !== this.event.defaultPeriod_id && !this.event.usePeriods) {
                    wiket.warning = 'Une période autre que<br />celle par défaut est utilisée.';
                }

                if (wiket.defaultGroup.id !== this.event.defaultGroup_id && !this.event.useGroups) {
                    wiket.warning =
                        'Un groupe par défaut autre que<br />celui de l`événement est utilisé.';
                }

                return wiket;
            });
        },

        disabledAdd() {
            return (
                (!this.wiket.period && this.event.usePeriods) ||
                (!this.wiket.defaultGroup && this.event.useGroups) ||
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
