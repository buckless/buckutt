<template>
  <div class="refund">
    <Card>
      <h3>Remboursement de solde</h3>

      <p>
        Si l'organisateur a activé cette option, vous pouvez être remboursé de votre solde restant.
        Le solde maximum remboursable correspond à la somme de vos rechargements sur Internet. Il n'est pas possible de rembourser les montants rechargés en physique.

        <br>
        <br>

        <template v-if="refundData.allowed">
          Vous pouvez demander le remboursement de <strong>{{ refundData.refundable / 100 | currency }}</strong>
        </template>
        <template v-else>
          <div
            v-for="(error, i) in whyCantRefund"
            :key="i">
            {{ error }}
          </div>
        </template>
      </p>

      <form
        class="actions"
        @submit.prevent="refund">
        <Button to="/dashboard/menu">Retour</Button>
        <Button
          v-if="refundData.allowed"
          :disabled="working"
          raised>Remboursement</Button>
      </form>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardRefund',

    components: {
        Card,
        Button
    },

    computed: {
        ...mapGetters({
            refundData: 'refund/refund',
            whyCantRefund: 'refund/whyCant',
            working: 'working/working'
        })
    },

    mounted() {
        this.refreshCanRefund();
    },

    methods: {
        ...mapActions({
            refund: 'refund/refund',
            refreshCanRefund: 'refund/canRefund'
        })
    }
};
</script>
