<template>
    <b-container dropShadow @close="back">
        <b-modal title="Ajouter un droit" @close="back" class="b-modal-create">
            <form @submit.prevent="createUserRight" class="b-create">
                <b-autocomplete
                    v-model="right.name"
                    label="Droit"
                    class="b-create-field"
                    :suggestions="rightsOptions"
                ></b-autocomplete>
                <b-autocomplete
                    v-model="right.point_id"
                    label="Point"
                    class="b-create-field"
                    :suggestions="[{ name: 'points', data: pointsOptions }]"
                    v-if="event.usePeriods"
                ></b-autocomplete>
                <b-autocomplete
                    v-model="right.period_id"
                    label="Période"
                    class="b-create-field"
                    :suggestions="[{ name: 'periods', data: currentPeriodsOptions }]"
                ></b-autocomplete>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="createUserRight">Valider</b-button>
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
        right: {
            name: null,
            period_id: null,
            point_id: null
        },
        rightsOptions: [
            {
                name: 'rights',
                data: [
                    { id: 'admin', label: 'Administrateur' },
                    { id: 'seller', label: 'Vendeur' },
                    { id: 'reloader', label: 'Banquier' },
                    { id: 'assigner', label: 'Opérateur de liaison de billets' },
                    { id: 'controller', label: 'Opérateur de contrôle' }
                ]
            }
        ]
    }),

    methods: {
        ...mapActions(['createObject', 'removeObject']),

        async createUserRight() {
            this.right.period_id = this.event.usePeriods
                ? this.right.period_id
                : this.event.defaultPeriod;
            this.right.user_id = this.focusedElement.id;

            await this.createObject({
                route: 'rights',
                value: this.right
            });

            this.back();
        },

        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['event', 'pointsOptions', 'currentPeriodsOptions', 'focusedElements']),

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
