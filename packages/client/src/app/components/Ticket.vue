<template>
    <div class="b-ticket" :class="{ 'b-ticket--modal': !inline }">
        <div class="b-ticket__modal">
            <hr v-if="inline" />

            Dernier client :
            <strong class="b--capitalized">{{ user.name || 'anonyme' }}</strong>

            <br />

            Achats :
            <strong><currency :value="user.bought || 0"></currency></strong>
            <template v-if="user.cardPaid > 0">
                (dont <currency :value="user.cardPaid"></currency> d'activation de carte)</template
            >

            <br />

            Rechargement :
            <strong><currency :value="user.reload || 0"></currency></strong>

            <br />

            Remboursement :
            <strong><currency :value="user.refund || 0"></currency></strong>

            <br />

            Nouveau crédit :
            <strong><currency :value="user.credit || 0"></currency></strong>

            <template v-if="user.usedCatering.length > 0">
                <br />
                Tickets utilisés:
                <div
                    v-for="catering in user.usedCatering"
                    class="b-ticket__catering"
                    :key="catering.id"
                >
                    {{ getCateringName(catering.id) }} : {{ catering.count }}
                </div>
            </template>
        </div>
        <div class="b-ticket__drop" @click="close"></div>
    </div>
</template>

<script>
import { mapState } from 'vuex';
import Currency from './Currency';

export default {
    props: {
        inline: Boolean,
        user: {
            type: Object,
            required: true
        }
    },

    components: {
        Currency
    },

    computed: mapState({
        coupons: state => state.device.coupons
    }),

    methods: {
        getCateringName(id) {
            try {
                return this.coupons.find(entry => entry.id === id).name;
            } catch (err) {
                console.log('couldnt find id', id, err);
                return 'Inconnu';
            }
        },

        close() {
            this.$store.commit('EMPTY_TICKET');
        }
    }
};
</script>

<style scoped>
@import '../main.css';

.b-ticket__modal {
    font-size: 18px;
    line-height: 1.5;
    text-align: left;
    padding: 40px !important;

    & > hr {
        border: 0;
        border-top: 1px solid color-mod($black a(0.2));
        position: relative;
        top: -35px;
        width: 50px;
    }
}

.b-ticket__catering {
    font-size: 16px;
}

.b-ticket--modal {
    & .b-ticket__modal {
        @add-mixin modal 400px;
        width: calc(100vw - 20px);
        max-width: 400px;
    }

    & .b-ticket__drop {
        @add-mixin modal-drop;

        background-color: $green;
    }
}

@media (max-width: 768px) {
    .b-ticket__modal {
        padding: 30px !important;
    }
}
</style>
