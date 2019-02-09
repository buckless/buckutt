<template>
  <div class="block">
    <Card>
      <h3>Bloquer mon support</h3>

      <form
        v-if="hasCard && !cardBlocked"
        @submit.prevent="block(card)">
        Votre espace cashless est associé avec le support <strong>{{ card }}</strong>.<br ><br >
        Souhaitez-vous bloquer le support ? Cette action est irreversible.
        <br>
        <br>
        <div class="actions">
          <Button
            :disabled="working"
            raised>Oui, bloquer mon support</button>
        </div>
      </form>
      <template v-else>
        <p>
          Ce compte est associé avec les supports bloqués suivants:
          <span
            v-for="(blockedCard, index) in blockedCards"
            :key="index">
            <strong>{{ blockedCard }}</strong>
            <template v-if="index < blockedCards.length - 1">, </template>
            <template v-else>.</template>
          </span>
          <br >
          <br >
        </p>
        <div class="actions">
          <Button
            raised
            to="/dashboard/menu">Retour</Button>
        </div>
      </template>
    </Card>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardBlock',

    components: {
        Card,
        Button
    },

    computed: {
        ...mapGetters({
            card: 'user/card',
            cardBlocked: 'user/cardBlocked',
            blockedCards: 'user/blockedCards',
            hasCard: 'user/hasCard',
            working: 'working/working'
        })
    },

    mounted() {
        if (!this.hasCard) {
            this.$router.push('/dashboard/menu');
        }
    },

    methods: {
        ...mapActions({
            block: 'assign/block'
        })
    }
};
</script>
