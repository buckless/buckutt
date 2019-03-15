<template>
    <div class="register-form">
        <form @submit.prevent="register(ticketNumber, card, cgu)">
            <div class="ticket">
                <TextInput
                    v-model="ticketNumber"
                    :disabled="working"
                    type="text"
                    label="Numéro de billet"
                    autofocus
                />
                <a class="customMail" v-if="!customMail" @click="customMail = !customMail">
                    Utiliser un autre mail que celui du billet
                </a>
            </div>
            <div class="ticket" v-if="customMail">
                <TextInput v-model="mail" :disabled="working" type="text" label="Mail" />
                <a class="customMail" @click="customMail = !customMail">
                    Utiliser le mail lié au billet
                </a>
            </div>
            <TextInput
                v-if="hasCard"
                v-model="card"
                :disabled="working"
                type="text"
                label="Identifiant de carte"
            />
            <Checkbox id="1" v-model="cgu" :disabled="working">
                J'accepte les
                <a href="https://buckless.com/static/cgu.pdf" rel="noopener noref nofollow"
                    >conditions générales de vente</a
                >.
            </Checkbox>
            <div class="actions">
                <Button to="/register">
                    Retour
                </Button>
                <Button :disabled="working" raised>
                    Inscription
                </Button>
            </div>
        </form>
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import TextInput from '@/components/TextInput';
import Checkbox from '@/components/Checkbox';
import Button from '@/components/Button';

export default {
    name: 'RegisterTicket',

    components: {
        TextInput,
        Checkbox,
        Button
    },

    data: () => ({
        cgu: false,
        customMail: false,
        mail: '',
        ticketNumber: '',
        card: ''
    }),

    computed: {
        ...mapGetters({
            hasCard: 'register/alreadyHasCard',
            working: 'working/working'
        })
    },

    methods: {
        ...mapActions({
            processRegister: 'register/register'
        }),

        async register(ticketNumber, card, cgu) {
            const result = await this.processRegister({
                ticketNumber,
                card,
                cgu,
                mail: this.customMail ? this.mail : undefined
            });

            if (result) {
                this.$router.push('/register/success');
            }
        }
    }
};
</script>

<style lang="scss" scoped>
.input-wrapper,
.checkbox-wrapper {
    margin-top: 1rem;
}

.ticket {
    position: relative;
    margin: 1rem 0;
}

.customMail {
    position: absolute;
    top: calc(1rem - 6px);
    right: 0;
    font-size: 0.8rem;
    transform: translateY(-50%);
    cursor: pointer;
}
</style>
