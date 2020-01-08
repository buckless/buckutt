<template>
    <b-container dropShadow @close="back">
        <b-modal title="Exporter le rapport final" @close="back">
            <form @submit.prevent="create" class="b-export">
                <strong>Note:</strong> L'export contiendra toutes les données de cet événement, au
                format XLSX.<br /><br />
                <b-select v-model="type" :options="options" label="Trier par" />
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
    data() {
        return {
            type: 'points'
        };
    },

    methods: {
        ...mapActions(['downloadReport', 'notify']),

        back() {
            this.$router.go(-1);
        },

        async download() {
            this.notify('Génération du fichier en cours...');
            await this.downloadReport({ type: this.type });
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
