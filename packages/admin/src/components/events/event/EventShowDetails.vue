<template>
    <div>
        <h5>Détails de l'événement</h5>
        <b-list :elements="elements" :columns="2"></b-list>
        <br />
        <h5>Zone danger</h5>
        <mdl-button colored raised @click.native="erase">Remise à zéro</mdl-button>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import { post } from '@/lib/fetch';

export default {
    computed: {
        ...mapState({
            focusedEvent: state => state.app.focusedElements[0]
        }),

        elements() {
            return [
                {
                    icon: 'local_drink',
                    title: 'Unités alcool maximales par participant',
                    content:
                        this.focusedEvent.maxAlcohol > 0
                            ? this.focusedEvent.maxAlcohol
                            : 'Pas de limite'
                },
                {
                    icon: 'attach_money',
                    type: 'price',
                    title: 'Rechargement minimal',
                    content: this.focusedEvent.minReload
                },
                {
                    icon: 'attach_money',
                    type: 'price',
                    title: 'Solde maximal',
                    content: this.focusedEvent.maxPerAccount
                }
            ];
        }
    },

    methods: {
        async erase() {
            if (
                !window.confirm(
                    "Remettre à zéro la base de données ? Cette opération n'est pas réversible"
                )
            ) {
                return;
            }

            try {
                await post('database/erase');
            } catch (err) {
                window.alert(
                    'Impossible de supprimer la base de données (environnement de développement requis)'
                );
                console.error(err);
            }

            window.alert('La base de données à été remise à zéro. Déconexion.');

            this.$router.push('/logout');
        }
    }
};
</script>
