<template>
    <div class="login">
        <h1>Interface cashless</h1>
        <p>
            Saisissez votre e-mail ainsi que votre code PIN pour accéder à l'interface cashless.
        </p>
        <form @submit.prevent="login">
            <TextInput v-model="mail" :disabled="working" label="Mail" />
            <div class="pin">
                <TextInput
                    v-model="pin"
                    :disabled="working"
                    type="password"
                    label="Code PIN"
                    maxlength="4"
                />
                <router-link class="forgot" to="forgot">
                    Oublié ?
                </router-link>
            </div>
            <Button :disabled="working" raised>
                Connexion
            </Button>
        </form>
        <div class="register" @click="register" v-if="showRegistration">
            Pas encore de compte cashless ?
            <br />
            <router-link to="register">Inscription</router-link>
        </div>
    </div>
</template>

<script>
import { allowRegistration } from 'config/manager';
import { mapActions, mapGetters } from 'vuex';
import afterUrl from '@/lib/redirectAfterLogin';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default {
    name: 'Login',

    components: {
        TextInput,
        Button,
        Icon
    },

    data: () => ({
        showRegistration: allowRegistration === '1',
        mail: '',
        pin: ''
    }),

    computed: {
        ...mapGetters({
            working: 'working/working'
        })
    },

    methods: {
        register() {
            this.$router.push('/register');
        },

        async login() {
            await this.processLogin({ mail: this.mail, pin: this.pin });

            this.$router.push(afterUrl());
        },

        ...mapActions({
            processLogin: 'user/login'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.login {
    padding: 1.5rem;
    max-width: 700px;
    margin: 0 auto;
}

.card-wrapper {
    max-width: 600px;
    width: 100%;
}

.pin {
    position: relative;
    margin: 1rem 0;
}

.forgot {
    position: absolute;
    top: calc(1rem - 6px);
    right: 0;
    font-size: 0.8rem;
    transform: translateY(-50%);
}

.button {
    width: 100%;
    margin: 0 auto;
}

.register {
    width: 100%;
    text-align: center;
    margin: 1rem auto 0 auto;
    cursor: pointer;
    max-width: 300px;
    padding: 1rem;
    border: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 4px;
}
</style>
