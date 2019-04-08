<template>
    <div class="register-form">
        <form @submit.prevent="register(firstname, lastname, mail, card, cgu)">
            <TextInput
                v-model="firstname"
                :disabled="working"
                type="text"
                :label="$t('register.form.firstname')"
                autofocus
            />
            <TextInput
                v-model="lastname"
                :disabled="working"
                type="text"
                :label="$t('register.form.lastname')"
            />
            <TextInput
                v-model="mail"
                :disabled="working"
                type="text"
                :label="$t('register.form.mail')"
            />
            <TextInput
                v-if="hasCard"
                v-model="card"
                :disabled="working"
                type="text"
                :label="$t('register.form.identifier')"
            />
            <Checkbox id="1" v-model="cgu" :disabled="working">
                <span v-html="$t('register.form.conditions')"></span>
            </Checkbox>
            <div class="actions">
                <Button to="/register">
                    {{ $t('ui.back') }}
                </Button>
                <Button :disabled="working" raised>
                    {{ $t('register.form.signin') }}
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
