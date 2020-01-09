<template>
    <LoginLayout :title="$t('views.register.title')">
        <form class="form" @submit.prevent="handleSubmit">
            <Checkbox v-model="havingSupport">{{ $t('views.register.ticket.having') }}</Checkbox>

            <Ticket uid="T123456" />

            <Input
                v-if="havingSupport"
                class="uid"
                name="uid"
                type="text"
                v-model="ticketNumber"
                :label="$t('views.register.ticket.number')"
                placeholder="T123456"
            />

            <div class="actions">
                <Button to="/register/card" type="button">{{ $t('common.back') }}</Button>
                <Button type="submit" raised :disabled="isFetching">{{
                    $t('common.register')
                }}</Button>
            </div>
        </form>
    </LoginLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import Checkbox from 'ui/src/components/Checkbox/Checkbox';
import Ticket from '../../components/ticket/Ticket';

import LoginLayout from '../../layouts/Login';

export default {
    components: {
        Input,
        Button,
        Checkbox,
        Ticket,
        LoginLayout
    },

    data: () => ({
        havingSupport: false,
        ticketNumber: ''
    }),

    computed: {
        ...mapGetters({
            isFetching: 'register/getIsFetching',
            initialUserInfos: 'register/getRegisterFormData'
        })
    },

    methods: {
        ...mapActions({
            submitTicketInfos: 'register/submitTicketInfos',
            register: 'register/register'
        }),

        async handleSubmit() {
            const { havingSupport, ticketNumber } = this.$data;

            await this.submitTicketInfos({
                ticketNumber: havingSupport && ticketNumber.length ? ticketNumber : null
            });

            const success = await this.register();

            if (success) {
                this.$router.push('/register/success');
            }
        }
    },

    mounted() {
        if (this.initialUserInfos.ticketNumber && this.initialUserInfos.ticketNumber.length > 0) {
            this.havingSupport = true;
            this.ticketNumber = this.initialUserInfos.ticketNumber;
        }
    }
};
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}

.ticket {
    margin: 20px auto 0 auto;
}

.uid {
    margin-top: 20px;
}

.actions {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
}
</style>
