<template>
    <div class="forgot">
        <h1 v-if="!key">{{ $t('forgot.title') }}</h1>
        <h1 v-else>{{ $t('forgot.step2title') }}</h1>

        <form v-if="!key" @submit.prevent="sendReset(mail)">
            <p>{{ $t('forgot.info') }}</p>
            <TextInput
                v-model="mail"
                :disabled="working"
                placeholder="nom@mail.com"
                :label="$t('forgot.mail')"
            />
            <div class="actions">
                <Button to="/login">
                    {{ $t('ui.back') }}
                </Button>
                <Button :disabled="working" raised>
                    {{ $t('ui.send') }}
                </Button>
            </div>
        </form>
        <form v-else @submit.prevent="reset(key, pin, confirmation)">
            <p>{{ $t('forgot.step2info') }}</p>
            <TextInput
                v-model="pin"
                :disabled="working"
                pattern="\d{4}"
                maxlength="4"
                type="password"
                :label="$t('dashboard.pin.new')"
            />
            <TextInput
                v-model="confirmation"
                :disabled="working"
                pattern="\d{4}"
                maxlength="4"
                type="password"
                :label="$t('dashboard.pin.confirm')"
            />
            <div class="actions">
                <Button to="/login">
                    {{ $t('ui.back') }}
                </Button>
                <Button :disabled="working" raised>
                    {{ $t('ui.send') }}
                </Button>
            </div>
        </form>
    </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Icon from '@/components/Icon';

export default {
    name: 'Forgot',

    components: {
        TextInput,
        Button,
        Icon
    },

    data() {
        return {
            mail: '',
            pin: '',
            confirmation: '',
            key: this.$route.query.key
        };
    },

    computed: {
        ...mapGetters({
            working: 'working/working'
        })
    },

    methods: {
        async sendReset(mail) {
            const sent = await this.processSendReset(mail);

            if (sent) {
                this.$router.push('/login');
            }
        },

        async reset(key, pin, confirmation) {
            const reset = await this.processReset({ key, pin, confirmation });

            if (reset) {
                this.$router.push('/login');
            }
        },

        ...mapActions({
            processReset: 'pin/reset',
            processSendReset: 'pin/sendReset'
        })
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.forgot {
    padding: 1.5rem;
    max-width: 700px;
    width: 100%;
    margin: 0 auto;
}

.input-wrapper {
    margin-top: 1rem;
}
</style>
