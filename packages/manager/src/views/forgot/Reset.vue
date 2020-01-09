<template>
    <LoginLayout :title="$t('views.forgot.reset.title')">
        <template v-slot>
            <form class="form" @submit.prevent="handleSubmit">
                <Input
                    class="password"
                    name="password"
                    type="password"
                    v-model="password"
                    :label="$t('views.forgot.reset.password')"
                    :invalid="Boolean(errors.password)"
                    @blur="validate"
                />
                <Input
                    class="password"
                    name="confirmation"
                    type="password"
                    v-model="confirmation"
                    :label="$t('views.forgot.reset.confirmation')"
                    :invalid="Boolean(errors.confirmation)"
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

import { validateResetForm } from './validate';

export default {
    components: {
        Input,
        Button,
        PageLink,
        LoginLayout
    },

    data: () => ({
        password: '',
        confirmation: '',
        errors: {}
    }),

    methods: {
        ...mapActions({
            resetPassword: 'user/resetPassword'
        }),

        validate: buildValidation(['password', 'confirmation'], validateResetForm),

        async handleSubmit() {
            if (!this.validate()) {
                return;
            }

            const { password } = this.$data;

            await this.resetPassword({ password, key: this.key });

            this.$router.push('/login');
        }
    },

    computed: {
        key() {
            return this.$route.params.key;
        }
    }
};
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}

.password {
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
