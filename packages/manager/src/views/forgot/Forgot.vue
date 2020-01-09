<template>
    <LoginLayout :title="$t('views.forgot.title')">
        <template v-slot>
            <form class="form" @submit.prevent="handleSubmit">
                <Input
                    class="mail"
                    name="mail"
                    type="text"
                    v-model="mail"
                    :label="$t('views.forgot.mail')"
                    :invalid="Boolean(errors.mail)"
                    @blur="validate"
                />
                <Button class="send" raised>{{ $t('common.send') }}</Button>
                <router-link class="login" to="/login">{{ $t('common.login') }}</router-link>
            </form>
        </template>
    </LoginLayout>
</template>

<script>
import { mapActions } from 'vuex';

import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import PageLink from '../../components/pageLink/PageLink';
import LoginLayout from '../../layouts/Login';

import { buildValidation } from '../../utils/formValidation';

import { validateForgotForm } from './validate';

export default {
    components: {
        Input,
        Button,
        PageLink,
        LoginLayout
    },

    data: () => ({
        mail: '',
        errors: {}
    }),

    methods: {
        ...mapActions({
            forgot: 'user/forgot'
        }),

        validate: buildValidation(['mail'], validateForgotForm),

        async handleSubmit() {
            if (!this.validate()) {
                return;
            }

            const { mail } = this.$data;

            await this.forgot({ mail });

            this.$router.push('/login');
        }
    }
};
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}

.mail {
    margin-bottom: 20px;
}

.send {
    margin-bottom: 24px;
}

.login {
    align-self: center;

    font-weight: var(--typography-button-weight);
    font-size: var(--typography-button-size);

    color: var(--primary-300);
    text-decoration: none;
}
</style>
