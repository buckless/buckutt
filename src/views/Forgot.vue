<template>
  <div class="forgot">
    <h1 v-if="!key">Code PIN oublié</h1>
    <h1 v-else>Réinitialisation du code PIN</h1>

    <form 
      v-if="!key" 
      @submit.prevent="sendReset(mail)">
      <p>
        Saisissez votre e-mail ci-dessous. Vous receverez par e-mail un lien vous permettant de changer votre mot de passe.
      </p>
      <TextInput 
        v-model="mail" 
        :disabled="working" 
        placeholder="nom@mail.com" 
        label="E-mail" />
      <div class="actions">
        <Button to="/login">
          Retour
        </Button>
        <Button 
          :disabled="working" 
          raised>
          Envoyer
        </Button>
      </div>
    </form>
    <form 
      v-else 
      @submit.prevent="reset(key, pin, confirmation)">
      <p>
        Le nouveau code PIN doit exclusivement être composé de 4 chiffres.
      </p>
      <TextInput 
        v-model="pin" 
        :disabled="working" 
        type="password" 
        label="Code PIN" />
      <TextInput 
        v-model="confirmation" 
        :disabled="working" 
        type="password" 
        label="Confirmation" />
      <div class="actions">
        <Button to="/login">
          Retour
        </Button>
        <Button 
          :disabled="working" 
          raised>
          Envoyer
        </Button>
      </div>
    </form>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default {
    name: 'Forgot',

    components: {
        TextInput,
        Button,
        Icon
    },

    data() {
        return {
            mail: '',
            pin: '',
            confirmation: '',
            key: this.$route.query.key
        };
    },

    computed: {
        ...mapGetters({
            working: 'working/working'
        })
    },

    methods: {
        async sendReset(mail) {
            await this.processSendReset(mail);

            this.$router.push('/login');
        },

        async reset(key, pin, confirmation) {
            await this.processReset({ key, pin, confirmation });

            this.$router.push('/login');
        },

        ...mapActions({
            processReset: 'pin/reset',
            processSendReset: 'pin/sendReset'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.forgot {
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
}

.input-wrapper {
    margin-top: 1rem;
}
</style>
