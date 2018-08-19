<template>
  <div class="reloadStatus">
    <Card>
      <h2 class="title">Rechargement</h2>
      <p v-if="status === 'success'">
        Le paiement <strong>a bien été pris en compte</strong>. Il sera effectif d'ici quelques instants.
      </p>
      <p v-else-if="status === 'waiting'">
        Votre rechargement est en cours...
      </p>
      <p v-else>
        Le paiement <strong>n'a pas été pris en compte</strong>. Contactez votre banque si vous ne pensez pas que cela correspond à un fonctionnement normal.
      </p>
      <div
        v-if="status !== 'waiting'"
        class="actions">
        <Button
          raised
          to="/">Retour à l'accueil</Button>
      </div>
    </Card>
  </div>
</template>

<script>
import Card from '@/components/Card';
import Button from '@/components/Button';

export default {
    name: 'DashboardReloadStatus',

    components: {
        Card,
        Button
    },

    data() {
        return {
            status: this.$route.params.status
        };
    },

    mounted() {
        // if (this.$route.query.RETURNMAC && this.$route.query.hostedCheckoutId) {
        //     const hCI = `hostedCheckoutId=${this.$route.query.hostedCheckoutId}`;
        //     const RM = `RETURNMAC=${this.$route.query.RETURNMAC}`;
        //     get(`callback?${hCI}&${RM}&isNotification=1`);
        // }
        // if (this.$route.query.form_data) {
        //     get(`callback?form_data=${this.$route.query.form_data}`)
        //         .then(res => {
        //             this.$router.push('/reload/success');
        //         })
        //         .catch(res => {
        //             this.$router.push('/reload/failed');
        //             throw res;
        //         });
        // }
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.reloadStatus {
    padding: 1rem 0;
}

.title {
    font-weight: 500;
    margin-top: 0;
}
</style>
