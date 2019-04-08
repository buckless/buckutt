<template>
    <div class="card-content">
        <template v-if="showTicket">
            <p>{{ $t('register.chooser.ticketinfo') }}</p>
            <Checkbox id="1" v-model="ticket">{{ $t('register.chooser.ticketbox') }}</Checkbox>
        </template>
        <template v-if="showCard">
            <p>{{ $t('register.chooser.cardinfo') }}</p>
            <Checkbox id="2" v-model="card">{{ $t('register.chooser.cardbox') }}</Checkbox>
        </template>
        <div class="actions">
            <Button to="/login">
                {{ $t('ui.back') }}
            </Button>
            <Button raised @click="next">
                {{ $t('ui.next') }}
            </Button>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import TextInput from '@/components/TextInput';
import Button from '@/components/Button';
import Checkbox from '@/components/Checkbox';
import { menu } from 'config/manager';

export default {
    name: 'RegisterChooser',

    components: {
        TextInput,
        Button,
        Checkbox
    },

    data() {
        return {
            card: false,
            ticket: false,
            showTicket: menu.showTicket,
            showCard: menu.showCard
        };
    },

    methods: {
        async next() {
            await this.setHasCard(this.card);

            this.$router.push(this.ticket ? '/register/ticket' : '/register/form');
        },

        ...mapActions({
            setHasCard: 'register/setHasCard'
        })
    },

    mounted() {
        if (!this.showTicket && !this.showCard) {
            this.next();
        }
    }
};
</script>
