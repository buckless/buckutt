<template>
    <LoginLayout :title="$t('views.register.title')">
        <form class="form" @submit.prevent="handleSubmit">
            <Checkbox v-model="havingCard">
                {{ $t('views.register.card.having') }}
            </Checkbox>

            <PhysicalCard uid="S07A6J9" />

            <Input
                v-if="havingCard"
                class="physicalId"
                name="physicalId"
                type="text"
                v-model="physicalId"
                :label="$t('views.register.card.number')"
                placeholder="S07A6J9"
            />

            <div class="actions">
                <Button to="/register" type="button">{{ $t('common.back') }}</Button>
                <Button type="submit" raised>{{ $t('common.next') }}</Button>
            </div>
        </form>
    </LoginLayout>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';

import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';
import Checkbox from 'ui/src/components/Checkbox/Checkbox';
import PhysicalCard from '../../components/physical-card/PhysicalCard';

import LoginLayout from '../../layouts/Login';

export default {
    components: {
        Input,
        Button,
        Checkbox,
        PhysicalCard,
        LoginLayout
    },

    data: () => ({
        havingCard: false,
        physicalId: ''
    }),

    computed: {
        ...mapGetters({
            initialUserInfos: 'register/getRegisterFormData'
        })
    },

    methods: {
        ...mapActions({
            submitCardInfos: 'register/submitCardInfos'
        }),

        async handleSubmit() {
            const { havingCard, physicalId } = this.$data;

            await this.submitCardInfos({
                physicalId: havingCard && physicalId.length ? physicalId : null
            });

            this.$router.push('/register/ticket');
        }
    },

    mounted() {
        if (this.initialUserInfos.physicalId && this.initialUserInfos.physicalId.length > 0) {
            this.havingCard = true;
            this.physicalId = this.initialUserInfos.physicalId;
        }
    }
};
</script>

<style scoped>
.form {
    display: flex;
    flex-direction: column;
}

.physical-card {
    margin: 20px auto 0 auto;
}

.physicalId {
    margin-top: 20px;
}

.actions {
    display: flex;
    justify-content: space-between;
    margin-top: 32px;
}
</style>
