<template>
    <div>
        <h5>Détails de l'utilisateur</h5>
        <p v-if="creationData.pin">Le code PIN de l'utilisateur est <strong>{{ creationData.pin }}</strong></p>
        <p v-if="creationData.password">Le mot de passe de l'utilisateur est <strong>{{ creationData.password }}</strong></p>

        <b-list :elements="elements" :columns="2"></b-list>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    methods: {
        ...mapActions(['updateCreationData'])
    },

    computed: {
        ...mapState({
            focusedUser: state => state.app.focusedElements[0],
            creationData: state => state.app.creationData
        }),

        elements() {
            const baseElements = [
                {
                    icon: 'person',
                    title: 'Nom',
                    content: this.focusedUser.lastname
                },
                {
                    icon: 'person',
                    title: 'Prénom',
                    content: this.focusedUser.firstname
                },
                {
                    icon: 'person',
                    title: 'Surnom',
                    content: this.focusedUser.nickname
                },
                {
                    icon: 'email',
                    title: 'Adresse mail',
                    content: this.focusedUser.mail
                },
                {
                    icon: 'attach_money',
                    type: 'price',
                    title: 'Solde',
                    content: this.focusedUser.credit
                }
            ];

            return baseElements;
        }
    },

    beforeDestroy() {
        this.updateCreationData({});
    }
};
</script>
