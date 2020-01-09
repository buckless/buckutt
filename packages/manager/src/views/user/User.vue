<template>
    <DashboardPageLayout>
        <template v-slot:hero>
            <UserHero />
        </template>
        <template v-slot>
            <div class="user">
                <div class="tips">
                    <ProTip
                        class="protip"
                        :title="$t('views.user.tips.protect.title')"
                        :subtitle="$t('views.user.tips.protect.subtitle')"
                    />
                </div>

                <h3 class="user-title">{{ $t('views.user.profile.title') }}</h3>

                <form @submit.prevent="handleProfile" class="profile">
                    <div class="inputs">
                        <div class="sub-inputs">
                            <h4 class="sub-inputs-title">
                                {{ $t('views.user.profile.changePassword') }}
                            </h4>
                            <Input
                                name="oldPassword"
                                type="password"
                                :label="$t('views.user.profile.oldPassword')"
                                :placeholder="$t('views.user.profile.dontChange')"
                                v-model="currentPassword"
                                :invalid="Boolean(errors.currentPassword)"
                                @blur="validate"
                            />

                            <Input
                                name="newPassword"
                                type="password"
                                :label="$t('views.user.profile.password')"
                                v-model="password"
                                v-show="currentPassword"
                                :invalid="Boolean(errors.password)"
                                @blur="validate"
                            />

                            <Input
                                name="confirmation"
                                type="password"
                                :label="$t('views.user.profile.confirmationPassword')"
                                v-model="confirmation"
                                v-show="currentPassword"
                                :invalid="Boolean(errors.confirmation)"
                                @blur="validate"
                            />
                        </div>

                        <div class="sub-inputs">
                            <h4 class="sub-inputs-title">
                                {{ $t('views.user.profile.changePin') }}
                            </h4>

                            <Input
                                name="oldPin"
                                type="password"
                                :label="$t('views.user.profile.oldPin')"
                                :placeholder="$t('views.user.profile.dontChange')"
                                v-model="currentPin"
                                :invalid="Boolean(errors.currentPin)"
                                @blur="validate"
                            />

                            <Input
                                name="newPin"
                                type="password"
                                :label="$t('views.user.profile.pin')"
                                v-model="pin"
                                v-show="currentPin"
                                :invalid="Boolean(errors.pin)"
                                @blur="validate"
                            />

                            <Input
                                name="confirmation"
                                type="password"
                                :label="$t('views.user.profile.confirmationPin')"
                                v-model="confirmationPin"
                                v-show="currentPin"
                                :invalid="Boolean(errors.confirmationPin)"
                                @blur="validate"
                            />
                        </div>
                    </div>

                    <Button type="submit" raised>{{ $t('common.save') }}</Button>
                </form>
            </div>
        </template>
    </DashboardPageLayout>
</template>

<script>
import ProTip from 'ui/src/components/ProTip/ProTip';
import Input from 'ui/src/components/Input/Input';
import Button from 'ui/src/components/Button/Button';

import DashboardPageLayout from '../../layouts/DashboardPage';
import UserHero from './UserHero';

import { buildValidation } from '../../utils/formValidation';

import { validateUserForm } from './validate';
import { mapActions, mapGetters } from 'vuex';

export default {
    components: {
        DashboardPageLayout,
        UserHero,
        Input,
        Button,
        ProTip
    },

    data: () => ({
        currentPassword: '',
        password: '',
        confirmation: '',
        currentPin: '',
        pin: '',
        confirmationPin: '',
        errors: {}
    }),

    methods: {
        ...mapActions({
            changePassword: 'user/changePassword'
        }),

        validate: buildValidation(
            ['currentPassword', 'password', 'confirmation', 'currentPin', 'pin', 'confirmationPin'],
            validateUserForm
        ),

        async handleProfile() {
            if (!this.validate()) {
                return;
            }

            const { currentPassword, password, currentPin, pin } = this.$data;

            await this.changePassword({ currentPassword, password, currentPin, pin });

            this.currentPassword = '';
            this.password = '';
            this.confirmation = '';
            this.currentPin = '';
            this.pin = '';
            this.confirmationPin = '';
        }
    },

    computed: {
        ...mapGetters({
            user: 'user/getUser'
        }),

        hasRights() {
            return this.user.right.length > 0;
        }
    }
};
</script>

<style scoped>
.tips {
    display: flex;
}

.protip {
    width: 475px;
    margin: 0;
}

.protip:not(:last-child) {
    margin-right: 24px;
}

.user-title {
    margin: 40px 0;
    font-size: var(--typography-h3-size);
    letter-spacing: var(--typography-h3-spacing);
    font-weight: var(--typography-h3-weight);
}

.profile {
    max-width: 620px;
}

.inputs {
    display: flex;
    justify-content: space-between;
}

.sub-inputs {
    max-width: 300px;
}

.sub-inputs-title {
    margin-top: 0;
}

.sub-inputs > label {
    display: block;
    margin-bottom: 16px;
}

@media (max-width: 768px) {
    .inputs {
        flex-direction: column;
    }

    .tips {
        flex-wrap: nowrap;
        height: 105px;
        overflow-y: auto;
    }

    .protip {
        min-width: calc(100vw - 20px - 20px - 4px -4px);
    }

    .user-title {
        margin: 30px 0 16px 0;
    }
}
</style>
