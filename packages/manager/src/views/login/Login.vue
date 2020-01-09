<template>
    <LoginLayout :title="$t('views.login.title')">
        <template v-slot>
            <form class="form" @submit.prevent="handleSubmit">
                <Input
                    class="mail"
                    name="mail"
                    type="text"
                    v-model="mail"
                    :label="$t('views.login.mail')"
                    :invalid="Boolean(errors.mail)"
                    @blur="validate"
                />
                <Input
                    class="password"
                    name="password"
                    type="password"
                    v-model="password"
                    :label="$t('views.login.password')"
                    :invalid="Boolean(errors.password)"
                    @blur="validate"
                />
                <Button class="login" raised>{{ $t('common.login') }}</Button>
                <router-link class="register" to="/register" v-if="event.allowRegistration">{{
                    $t('common.register')
                }}</router-link>
            </form>
        </template>

        <template v-slot:links>
            <PageLink to="/forgot">{{ $t('views.login.forgot') }}</PageLink>
        </template>
    </LoginLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import PageLink from '../../components/pageLink/PageLink';
import LoginLayout from '../../layouts/Login';

import { buildValidation } from '../../utils/formValidation';

import { validateLoginForm } from './validate';

export default {
    components: {
        Input,
        Button,
        PageLink,
        LoginLayout
    },

    data: () => ({
        mail: '',
        password: '',
        errors: {}
    }),

    methods: {
        ...mapActions({
            login: 'user/login'
        }),

        validate: buildValidation(['mail', 'password'], validateLoginForm),

        handleSubmit() {
            if (!this.validate()) {
                return;
            }

            const { mail, password } = this.$data;

            this.login({ mail, password });
        }
    },

    computed: mapGetters({
        event: 'infos/getEvent'
    })
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

.password {
    margin-bottom: 32px;
}

.login {
    margin-bottom: 24px;
}

.register {
    align-self: center;

    font-weight: var(--typography-button-weight);
    font-size: var(--typography-button-size);

    color: var(--primary-300);
    text-decoration: none;
}
</style>
