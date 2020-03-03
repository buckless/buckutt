<template>
    <b-container dropShadow @close="back">
        <b-modal title="Exporter le rapport final" @close="back">
            <form @submit.prevent="create" class="b-export">
                <b-select v-model="type" :options="options" label="Trier par" /><br />

                <b-checkbox v-model="deactivateFilters">Désactiver les filtres</b-checkbox><br /><br />

                <template v-if="deactivateFilters">
                    <strong>Note:</strong> L'export contiendra toutes les données de cet événement, au
                    format XLSX.
                </template>
                <template v-else>
                    <strong>Note:</strong> L'export contiendra les données en respectant les filtres prédéfinis, au
                    format XLSX.
                </template>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="download">Exporter</b-button>
            </template>
        </b-modal>
    </b-container>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

export default {
    props: {
        fields: Object
    },

    data() {
        return {
            type: 'points',
            deactivateFilters: false
        };
    },

    methods: {
        ...mapActions(['downloadReport', 'notify']),

        back() {
            this.$router.go(-1);
        },

        async download() {
            const filters = this.deactivateFilters ? {} : this.fields;

            this.notify('Génération du fichier en cours...');
            await this.downloadReport({ type: this.type, filters });
            this.notify('Le téléchargement a été lancé');
            this.back();
        }
    },

    computed: {
        ...mapGetters(['event']),

        options() {
            const options = [{ value: 'points', name: 'Guichets' }];

            if (this.event.useFundations) {
                options.push({
                    value: 'fundations',
                    name: 'Fondations pour les ventes, guichets pour le reste'
                });
            }

            return options;
        }
    }
};
</script>
