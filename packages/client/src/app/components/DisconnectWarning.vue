<template>
    <div class="b-disconnect-warning" v-if="disconnectWarning">
        <div class="b-disconnect-warning__modal">
            <h1>Déconnexion</h1>
            <p>
                Êtes-vous sûr de vouloir déconnecter l'opérateur
                <span class="b--capitalized">{{ seller.firstname }} {{ seller.lastname }}</span>
                ?
            </p>
            <div class="b-disconnect-warning__modal__buttons">
                <button @click="cancelLogout">Annuler</button>
                <div></div>
                <button @click="logout">Se déconnecter</button>
            </div>
        </div>
        <div class="b-disconnect-warning__drop"></div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
    computed: mapState({
        disconnectWarning: state => state.auth.seller.disconnectWarning,
        seller: state => state.auth.seller
    }),

    methods: {
        logout() {
            this.pursueLogout().then(() => this.$router.push('/login'));
        },

        ...mapActions(['pursueLogout', 'cancelLogout'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-disconnect-warning__modal {
    padding: 15px !important;
    position: absolute;
    z-index: 2;

    @add-mixin modal 350px;
}

.b-disconnect-warning__modal > h1 {
    font-weight: 400;
    margin: 0;
}

.b-disconnect-warning__modal__buttons {
    display: flex;
    justify-content: center;
}

.b-disconnect-warning__modal__buttons > div {
    flex: 1;
}

.b-disconnect-warning__modal__buttons > button {
    background-color: #fff;
    border: 0;
    color: $lightblue;
    cursor: pointer;
    height: 36px;
    padding: 0 16px;
    border-radius: 2px;
    font-size: 14px;
    text-transform: uppercase;

    &:last-child {
        color: $red;
    }

    &:active,
    &:focus,
    &:hover {
        background-color: color-mod($black a(0.075));
    }
}

.b-disconnect-warning__drop {
    @add-mixin modal-drop;
}
</style>
