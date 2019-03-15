<template>
    <div class="register-form">
        <form @submit.prevent="register(firstname, lastname, mail, card, cgu)">
            <TextInput
                v-model="firstname"
                :disabled="working"
                type="text"
                label="Prénom"
                autofocus
            />
            <TextInput v-model="lastname" :disabled="working" type="text" label="Nom" />
            <TextInput v-model="mail" :disabled="working" type="text" label="Mail" />
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
    name: 'RegisterForm',

    components: {
        TextInput,
        Checkbox,
        Button
    },

    data: () => ({
        firstname: '',
        lastname: '',
        mail: '',
        card: '',
        cgu: false
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

        async register(firstname, lastname, mail, card, cgu) {
            const result = await this.processRegister({
                firstname,
                lastname,
                mail,
                card,
                cgu
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
</style>
