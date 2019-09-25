<template>
    <b-container dropShadow @close="back">
        <b-modal title="Ajouter un groupe" @close="back" class="b-modal-create">
            <form @submit.prevent="addToWalletOrUser" class="b-create">
                <b-autocomplete
                    v-model="membership.group_id"
                    label="Groupe"
                    class="b-create-field"
                    :suggestions="[{ name: 'groups', data: groupsOptions }]"
                ></b-autocomplete>
                <b-autocomplete
                    v-model="membership.period_id"
                    label="Période"
                    class="b-create-field"
                    :suggestions="[{ name: 'periods', data: currentPeriodsOptions }]"
                    v-if="event.usePeriods"
                ></b-autocomplete>
                <b-button v-show="false"></b-button>
            </form>
            <template slot="actions">
                <b-button @click="back">Annuler</b-button>
                <b-button raised accent @click="addToWalletOrUser">Valider</b-button>
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
        membership: {
            group_id: null,
            period_id: null
        }
    }),

    methods: {
        ...mapActions(['createObject', 'removeObject', 'notify']),

        async addToWalletOrUser() {
            if (this.model === 'wallets') {
                this.membership.wallet_id = this.focusedElement.id;
            } else {
                this.membership.group_id = this.focusedElement.id;
            }

            this.membership.period_id = this.event.usePeriods
                ? this.membership.period_id
                : this.event.defaultPeriod;

            const index = this.focusedElement.memberships.findIndex(
                m =>
                    m.group_id === this.membership.group_id &&
                    m.period_id === this.membership.period_id
            );

            if (index > -1) {
                return this.notify('Déjà membre du groupe sur cette période.');
            }

            await this.createObject({
                route: 'memberships',
                value: this.membership
            });

            this.back();
        },

        back() {
            this.$router.go(-1);
        }
    },

    computed: {
        ...mapGetters(['event', 'groupsOptions', 'currentPeriodsOptions', 'focusedElements']),

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
