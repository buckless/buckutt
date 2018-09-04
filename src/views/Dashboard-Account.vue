<template>
  <div>
    <Card v-if="linkedUsers.length > 0">
      <h3>Comptes liés</h3>
      <List>
        <div
          v-for="(user, i) in linkedUsers"
          :key="i"
          class="item"
          @click="switchUser(user.username, user.id)">
          <span
            v-if="user.id === currentUser.id"
            class="bullet"/>
          <span class="name">{{ user.firstname }} {{ user.lastname }}</span>
          &nbsp;
          <span class="credit">({{ user.credit | currency }})</span>
        </div>
      </List>
    </Card>
    <Card v-if="showQrCode">
      <h3>Mon QR Code</h3>
      <p>Une fois sur place, vous pourrez utiliser ce QR Code ou votre billet pour récupérer votre support cashless.</p>
      <img
        :src="qrcode"
        alt="qr code" >
    </Card>
    <Button @click="logout">Déconnexion</Button>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Card from '@/components/Card';
import List from '@/components/List';
import Button from '@/components/Button';

export default {
    name: 'DashboardAccount',

    components: {
        Card,
        List,
        Button
    },

    data: function() {
        return {
            showQrCode: process.env.VUE_APP_ACCOUNT_SHOW_QRCODE && this.qrcode
        };
    },

    computed: {
        qrcode() {
            const username = this.currentUser.meansOfLogin.find(mol => mol.type === 'username');

            if (!username) {
                return;
            }

            return `https://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=${username.data}`;
        },

        ...mapGetters({
            currentUser: 'user/user',
            linkedUsers: 'user/linkedUsers'
        })
    },

    methods: {
        async switchUser(username, id) {
            if (id === this.currentUser.id) {
                return;
            }

            await this.processSwitchUser(username);
        },

        ...mapActions({
            logout: 'user/logout',
            processSwitchUser: 'user/switchUser'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.name {
    margin-left: 0.5rem;
}

.credit {
    color: rgba($foreground, 0.8);
}

img {
    display: block;
    max-width: 100%;
    margin: 0 auto;
}

.button {
    display: block;
    margin: 1rem auto;
}
</style>
