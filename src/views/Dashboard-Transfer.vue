<template>
  <div class="transfer">
    <Card>
      <h3>Virement</h3>
      <p>Recherchez le destinataire avec le champ puis cliquez sur son nom. La bulle verte indique le compte receveur.</p>
      <form @submit.prevent="transfer(selected, amount)">
        <TextInput
          v-model="user"
          :disabled="working"
          type="text"
          label="Destinataire"
          placeholder="Entrez 4 caractères minimum"
          autofocus
          @input="findUser"/>

        <List
          v-if="results.length > 0"
          class="results">
          <div
            v-for="(result, i) in results"
            :key="i"
            class="item"
            @click="selectResult(result)">
            <span
              v-if="result.id === selected.id"
              class="bullet"/>
            <span class="name">{{ result.firstname }} {{ result.lastname }}</span>
            &nbsp;
            <span class="username">({{ result.username }})</span>
          </div>
        </List>

        <p v-if="results.length === 0 && user.length > 4">
          Aucun résultat.
        </p>

        <TextInput
          v-model="amount"
          :disabled="working"
          type="number"
          step="0.01"
          min="0.01"
          label="Montant (€)"/>

        <p v-if="selected.id">
          En cliquant sur « Envoyer », je confirme envoyer {{ amount | currency }} à {{ selected.firstname }} {{ selected.lastname }}
        </p>

        <div class="actions">
          <Button
            :disabled="working || !selected.id || amount === '0'"
            raised>Envoyer</Button>
        </div>
      </form>
    </Card>
  </div>
</template>

<script>
import debounce from 'debounce';
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import TextInput from '@/components/TextInput';
import List from '@/components/List';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default {
    name: 'DashboardTransfer',

    components: {
        Card,
        TextInput,
        List,
        Button,
        Icon
    },

    data: () => ({
        user: '',
        amount: '0'
    }),

    computed: {
        ...mapGetters({
            results: 'transfer/results',
            selected: 'transfer/selectedUser',
            working: 'working/working'
        })
    },

    mounted() {
        this.findUser = debounce(this.findUser, 400).bind(this);
    },

    methods: {
        async findUser() {
            if (this.user.length < 4) {
                this.clearResults();
                return;
            }

            await this.processFindUser(this.user);

            if (this.results.length === 1) {
                this.selectResult(this.results[0]);
            }
        },

        async transfer(user, amount) {
            const res = await this.processTransfer({ user, amount });

            if (res) {
                this.$router.push('/dashboard');
            }
        },

        selectResult(result) {
            this.processSelectResult(result);
        },

        ...mapActions({
            clearResults: 'transfer/clearResults',
            processTransfer: 'transfer/transfer',
            processSelectResult: 'transfer/selectResult',
            processFindUser: 'transfer/findUser'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.input-wrapper {
    margin: 1rem 0;
}

.list {
    margin-top: -0.8rem;
}

.name {
    margin: 0 0 0 0.5rem;
    font-weight: 500;
}

.username {
    color: $foreground;
}
</style>
