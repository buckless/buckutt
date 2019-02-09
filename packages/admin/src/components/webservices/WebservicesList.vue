<template>
    <div>
        <h5>Liste des webhooks</h5>
        <div class="b-table-search">
            <i class="material-icons">search</i>
            <mdl-textfield floating-label="Adresse du webhook" v-model="url"></mdl-textfield>
        </div>

        <b-table
            :headers="[{ title: 'Webhook', field: 'url', object: true }]"
            :data="webservices"
            :filter="{ val: this.url, field: 'url' }"
            :sort="{ field: 'url', order: 'ASC' }"
            :actions="[
                { action: 'edit', text: 'Modifier' },
                { action: 'remove', text: 'Supprimer', type: 'confirm' }
            ]"
            route="webservices"
            :paging="10"
            @edit="editWebservice"
            @remove="removeObject"
        >
        </b-table>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    data() {
        return {
            url: ''
        };
    },

    methods: {
        ...mapActions(['removeObject']),
        editWebservice(webservice) {
            this.$router.push(`/webservices/${webservice.id}/edit`);
        }
    },

    computed: {
        ...mapState({
            webservices: state => state.objects.webservices
        })
    }
};
</script>
