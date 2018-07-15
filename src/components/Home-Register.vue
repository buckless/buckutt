<template>
    <div class="b-home__register-chooser">
        <p>
            Si vous possédez un billet pour le festival, cochez cette case.
            <br/>
            Si vous ne possédez pas de billet et souhaitez utiliser le cashless à l'évènement, ne cochez pas cette case.
        </p>
        <b-checkbox id="ticket" v-model="ticket">J'ai déjà un billet</b-checkbox>
        <p>
            Si vous avez déjà votre support cashless, cochez cette case. Vous trouverez l'identifiant à rentrer au verso de votre support
        </p>
        <b-checkbox id="card" v-model="card">J'ai déjà un support cashless (carte, bracelet, ...)</b-checkbox>

        <div class="b-home__register-chooser__next">
            <button
                class="mdc-button mdc-button--raised"
                @click="next"
                >Suivant</button>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Checkbox from './Checkbox';

export default {
    components: {
        'b-checkbox': Checkbox
    },

    data() {
        return {
            state: 'ticket'
        };
    },

    computed: {
        ...mapState({
            stateTicket: state => state.register.ticket,
            stateCard: state => state.register.card
        }),

        ticket: {
            get() {
                return this.stateTicket;
            },

            set(value) {
                this.$store.commit('SET_TICKET', value);
            }
        },

        card: {
            get() {
                return this.stateCard;
            },

            set(value) {
                this.$store.commit('SET_CARD', value);
            }
        }
    },

    methods: {
        buttonClasses(value, reverse) {
            const active = reverse ? !this[value] : this[value];

            return {
                'mdc-button': true,
                'mdc-button--raised': active,
                'mdc-button--stroked': !active
            };
        },

        next() {
            if (this.ticket) {
                this.$router.push('register-ticket');
            } else {
                this.$router.push('register-account');
            }
        }
    }
};
</script>

<style>
.b-home__register-chooser {
    padding: 24px;
}

.b-home__register-chooser > p:first-child {
    margin-top: 0;
}

.b-home__register-chooser__choice {
    margin: 4px 0 16px 0;
}

.b-home__register-chooser__next {
    display: flex;
    flex-direction: row-reverse;
    margin-top: 16px;
}
</style>
