<template>
    <b-container dropShadow @close="back">
        <b-modal title="Assigner un guichet" @close="back" class="b-modal-create">
            <form @submit.prevent="addToDevice" class="b-create">
                <b-autocomplete
                    v-model="wiket.point_id"
                    label="Guichet"
                    class="b-create-field"
                    :suggestions="pointsOptions"
                ></b-autocomplete>
                <b-autocomplete
                    v-model="wiket.period_id"
                    label="Période"
                    class="b-create-field"
                    :suggestions="currentPeriodsOptions"
                    v-if="event.usePeriods"
                ></b-autocomplete>
                <b-autocomplete
                    v-model="wiket.defaultGroup_id"
                    label="Groupe par défaut"
                    class="b-create-field"
                    :suggestions="groupsOptions"
                    v-if="event.useGroups"
                ></b-autocomplete>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="addToDevice">Valider</b-button>
            </template>
        </b-modal>
    </b-container>
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
        wiket: {
            point_id: null,
            period_id: null
        }
    }),

    methods: {
        ...mapActions(['createObject', 'removeObject', 'notify']),

        async addToDevice() {
            this.wiket.device_id = this.focusedElement.id;

            this.wiket.period_id = this.event.usePeriods
                ? this.wiket.period_id
                : this.event.defaultPeriod;

            this.wiket.defaultGroup_id = this.event.useGroups
                ? this.wiket.defaultGroup_id
                : this.event.defaultGroup;

            try {
                await this.createObject({
                    route: 'wikets',
                    value: this.wiket
                });

                this.notify("Le guichet a bien été associé à l'équipement")
                this.back();
            } catch {
                this.notify("Une erreur a eu lieu lors de l'association");
            }
        },

        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['event', 'pointsOptions', 'groupsOptions', 'currentPeriodsOptions', 'focusedElements']),

        focusedElement() {
            return this.focusedElements[0];
        }
    }
};
</script>

<style scoped>
.b-modal-create {
    overflow: visible !important;
}

.b-create {
    & > .b-create-field {
        margin-top: 15px;
        display: block;
        width: 300px;
    }
}
</style>
