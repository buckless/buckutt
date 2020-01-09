<template>
    <LoginLayout :title="$t('views.register.title')">
        <form class="form" @submit.prevent="handleSubmit">
            <Input
                class="mail"
                name="mail"
                type="text"
                v-model="mail"
                @blur="validate"
                :invalid="Boolean(errors.mail)"
                :label="$t('views.register.mail')"
            />
            <div class="name">
                <Input
                    class="firstName"
                    name="firstName"
                    type="text"
                    v-model="firstName"
                    :invalid="Boolean(errors.firstName)"
                    @blur="validate"
                    :label="$t('views.register.firstname')"
                />
                <Input
                    class="lastName"
                    name="lastName"
                    type="text"
                    v-model="lastName"
                    :invalid="Boolean(errors.lastName)"
                    @blur="validate"
                    :label="$t('views.register.lastname')"
                />
            </div>

            <Input
                class="password"
                name="password"
                type="password"
                v-model="password"
                :invalid="Boolean(errors.password)"
                @blur="validate"
                :label="$t('views.register.password')"
            />

            <i18n path="views.register.terms" tag="p" class="cgu">
                <a href="https://buckless.com/static/cgu.pdf" target="_blank">{{
                    $t('views.register.tos')
                }}</a>
                <a href="https://buckless.com/static/cgu.pdf" target="_blank">{{
                    $t('views.register.confidentiality')
                }}</a>
            </i18n>

            <Button type="submit" class="start" raised>
                {{ $t('views.register.start') }}
                <Icon name="arrow_forward" />
            </Button>
            <router-link class="login" to="/login">{{ $t('common.login') }}</router-link>
        </form>
    </LoginLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import Icon from 'ui/src/components/Icon/Icon';

import LoginLayout from '../../layouts/Login';

import { buildValidation } from '../../utils/formValidation';

import { validateRegisterForm } from './validate';

export default {
    components: {
        Input,
        Button,
        Icon,
        LoginLayout
    },

    data: () => ({
        mail: '',
        firstName: '',
        lastName: '',
        password: '',
        errors: {}
    }),

    computed: {
        ...mapGetters({
            initialUserInfos: 'register/getRegisterFormData'
        })
    },

    methods: {
        ...mapActions({
            submitUserInfos: 'register/submitUserInfos'
        }),

        validate: buildValidation(
            ['mail', 'firstName', 'lastName', 'password'],
            validateRegisterForm
        ),

        async handleSubmit() {
            if (!this.validate()) {
                return;
            }

            const { mail, firstName, lastName, password } = this.$data;

            await this.submitUserInfos({
                mail,
                firstName,
                lastName,
                password
            });

            this.$router.push('/register/card');
        }
    },

    mounted() {
        this.mail = this.initialUserInfos.mail;
        this.firstName = this.initialUserInfos.firstname;
        this.lastName = this.initialUserInfos.lastname;
        this.password = this.initialUserInfos.password;
    }
};
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}

.mail,
.name {
    margin-bottom: 20px;
}

.name {
    display: flex;
}

.firstName {
    margin-right: 20px;
}

.password {
    margin-bottom: 24px;
}

.cgu {
    color: var(--foreground-dark-100);
    font-size: var(--typography-body-2-size);
    letter-spacing: var(--typography-body-2-spacing);
    font-weight: var(--typography-body-2-weight);
}

.cgu > a {
    color: inherit;
}

.start {
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
