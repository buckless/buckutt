<template>
  <div class="card-content">
    <p>
      Si vous possédez un billet pour le festival, cochez cette case.
      Si vous ne possédez pas de billet et souhaitez utiliser le cashless à l'évènement, ne cochez pas cette case.
    </p>
    <Checkbox 
      id="1" 
      v-model="ticket">J'ai déjà un billet</Checkbox>
    <p>
      Si vous avez déjà votre support cashless, cochez cette case. Vous trouverez l'identifiant à rentrer au verso de votre support.
    </p>
    <Checkbox 
      id="2" 
      v-model="card">J'ai déjà un support cashless (carte, bracelet, ...)</Checkbox>
    <div class="actions">
      <Button to="/login">
        Retour
      </Button>
      <Button 
        raised 
        @click="next">
        Suivant
      </Button>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';

export default {
    name: 'RegisterChooser',

    components: {
        TextInput,
        Button,
        Checkbox
    },

    data() {
        return {
            card: false,
            ticket: false
        };
    },

    methods: {
        async next() {
            await this.setHasCard(this.card);

            this.$router.push(this.ticket ? '/register/ticket' : '/register/form');
        },

        ...mapActions({
            setHasCard: 'register/setHasCard'
        })
    }
};
</script>
