<template>
    <div class="b-assigner-create-account">
        <form @submit.prevent="assignModalOpened = true">
            <input
                type="Number"
                name="credit"
                class="b-assigner-create-account__input"
                step="0.1"
                placeholder="Crédit (euros)"
                autocomplete="off"
                v-model="credit">
            <h4>Groupes :</h4>
            <div class="b-assigner-create-account__groups" v-if="groups.length > 0">
                <div class="b-assigner-create-account__groups__group" v-for="group in groups">
                    <input type="checkbox" name="group" class="b--out-of-screen" :id="group.id" v-model="activeGroups" :value="group">
                    <label :for="group.id">
                        {{ group.name }}
                    </label>
                </div>
            </div>
            <button @click.prevent="assignModalOpened = true">Valider</button>
        </form>
        <nfc mode="write" @read="assignCard" @cancel="assignModalOpened = false" v-if="assignModalOpened" disableSignCheck shouldPinLock :shouldPinUnlock="false">
            <strong>Compte anonyme</strong><br />
            Nouveau crédit: <strong><currency :value="numberCredit" /></strong>

            <template v-if="nfcCost.amount > 0">
                <br /><br />
                <strong>Encaisser <currency :value="nfcCost.amount" /> pour payer le support.</strong>
            </template>
        </nfc>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import Currency from './Currency';

export default {
    components: {
        Currency
    },

    data() {
        return {
            assignModalOpened: false,
            credit: null,
            activeGroups: []
        };
    },

    computed: {
        numberCredit() {
            return Math.round(this.credit * 100);
        },

        ...mapState({
            point: state => state.auth.device.point.id,
            nfcCosts: state => state.items.nfcCosts,
            defaultGroup: state =>
                state.auth.groups.find(group => group.name === state.auth.device.event.name),
            groups: state =>
                state.auth.groups.filter(group => group.name !== state.auth.device.event.name),
            useCardData: state => state.auth.device.event.config.useCardData
        }),

        nfcCost() {
            const now = new Date();
            const groupsToCheck = [this.defaultGroup].concat(this.activeGroups);
            const validCosts = this.nfcCosts
                .filter(
                    nfcCost =>
                        new Date(nfcCost.period.start) <= now &&
                        new Date(nfcCost.period.end) >= now &&
                        groupsToCheck.find(group => group.id === nfcCost.group_id)
                )
                .sort((a, b) => a.amount - b.amount);
            return validCosts.length === 0 ? { amount: 0 } : validCosts[0];
        }
    },

    methods: {
        assignCard(cardId, _, options) {
            if (this.assignModalOpened) {
                this.$store.commit('SET_DATA_LOADED', false);
                const groups = this.activeGroups.map(group => group.id);

                const anon = {
                    credit: this.numberCredit ? this.numberCredit : 0,
                    cardId,
                    groups,
                    anon: true
                };

                if (options.assignedCard) {
                    this.$store.commit('SET_DATA_LOADED', true);
                    return this.$store.commit('ERROR', { message: 'Card already assigned' });
                }

                const assignPromise = this.useCardData
                    ? new Promise(resolve => {
                          window.app.$root.$emit('readyToWrite', this.numberCredit, {
                              assignedCard: true,
                              catering: options.catering
                          });
                          window.app.$root.$on('writeCompleted', () => resolve());
                      })
                    : Promise.resolve();

                assignPromise
                    .then(() =>
                        this.sendRequest({
                            method: 'post',
                            url: 'services/manager/assigner',
                            data: anon
                        })
                    )
                    .then(() => this.ok())
                    .catch(err => this.$store.commit('ERROR', err.response.data))
                    .then(() => this.$store.commit('SET_DATA_LOADED', true));
            }
        },

        ok() {
            this.$emit('ok');
            this.assignModalOpened = false;
            this.credit = null;
            this.activeGroups = [];
        },

        ...mapActions(['sendRequest'])
    }
};
</script>

<style scoped>
@import '../main.css';

.b-assigner-create-account {
    background-color: #f3f3f3;
    flex: 1;
}

.b-assigner-create-account > form {
    width: 50%;
    max-width: 500px;
    margin: 40px auto;
}

.b-assigner-create-account h4 {
    text-transform: uppercase;
    color: rgba(0, 0, 0, 0.7);
}

.b-assigner-create-account__input {
    display: block;
    width: 100%;
    padding: 10px;
    border-radius: 42px;
    border: 1px solid rgba(0, 0, 0, 0.2);

    &:not(:first-child) {
        margin-top: 16px;
    }

    &:focus {
        outline: 0;
        border: 1px solid #2980b9;
    }
}

.b-assigner-create-account__groups {
    margin-top: 16px;
    background: #fff;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 3px;
}

.b-assigner-create-account__groups__group {
    & > label {
        display: block;
        width: 100%;
        padding: 10px;
        font-weight: 500;
    }

    & > input:checked + label {
        background-color: #2980b9;
        color: #fff;
    }
}

.b-assigner-create-account button {
    margin: 32px 0;
    background-color: $green;
    color: #fff;
    cursor: pointer;
    border: 0;
    width: 100%;
    font-size: 1.2rem;
    text-transform: uppercase;
    height: 50px;
    border-radius: 25px;
}

@media (max-width: 768px) {
    .b-assigner-create-account > form {
        width: calc(100% - 20px);
        margin: 10px auto;
    }
}
</style>
