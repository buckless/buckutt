<template>
    <div class="b-assigner-create-account">
        <form @submit.prevent="assignModalOpened = true">
            <input
                type="Number"
                name="credit"
                @focus="keepFocus"
                @blur="giveFocusBack"
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
        <modal v-show="assignModalOpened" :credit="numberCredit" name="Anon anon" :showGroups="false" @close="assignModalOpened = false"/>
    </div>
</template>

<script>
import axios from 'axios';
import { mapState, mapGetters, mapActions } from 'vuex';

import Modal from './Assigner-Modal';

export default {
    components: {
        Modal
    },

    data() {
        return {
            assignModalOpened: false,
            credit: null,
            activeGroups: []
        }
    },

    computed: {
        numberCredit() {
            return Math.round(this.credit * 100);
        },

        ...mapState({
            online     : state => state.online.status,
            point      : state => state.auth.device.point.id,
            seller     : state => state.auth.seller.id,
            groups     : state => state.auth.groups.filter(group => group.name !== 'Défaut'),
            useCardData: state => state.auth.device.event.config.useCardData
        }),

        ...mapGetters(['tokenHeaders'])
    },

    methods: {
        assignCard(cardId) {
            if (this.assignModalOpened) {
                let promise = Promise.resolve();
                const groups = this.activeGroups.map(group => group.id);

                const anon = {
                    credit: this.numberCredit ? this.numberCredit : 0,
                    cardId,
                    groups
                };

                if (this.online) {
                    promise = promise.then(() => axios.post(
                        `${config.api}/services/assigner/anon`,
                        anon,
                        this.tokenHeaders
                    ));
                } else {
                    promise = promise.then(() => this.addPendingRequest({
                        url: `${config.api}/services/assigner/anon`,
                        body: anon
                    }));
                }

                promise = promise
                    .catch((err) => {
                        if (err.response.data.message === 'Duplicate Entry') {
                            // ignore duplicate entry, write to card anyway
                            this.useCardData && window.nfc.write(
                                window.nfc.creditToData(this.assignModalCredit, config.signingKey)
                            );

                            this.ok();
                        }

                        this.$store.commit('ERROR', err.response.data);
                    });

                this.useCardData && window.nfc.write(
                    window.nfc.creditToData(this.numberCredit, config.signingKey)
                );

                this.ok();
            }
        },

        ok() {
            this.$emit('ok');
            this.assignModalOpened = false;
            this.credit = null;
            this.activeGroups = [];
        },

        keepFocus() {
            document.querySelector('#app > input').disabled = true;
        },

        giveFocusBack() {
            document.querySelector('#app > input').disabled = false;
        },

        ...mapActions(['addPendingRequest'])
    }
}
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
    color: rgba(0,0,0,.7);
}

.b-assigner-create-account__input {
    display: block;
    width: 100%;
    padding: 10px;
    border-radius: 42px;
    border: 1px solid rgba(0,0,0,.2);

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
    border: 1px solid rgba(0,0,0,.2);
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

@media(max-width: 768px) {
    .b-assigner-create-account > form {
        width: calc(100% - 20px);
        margin: 10px auto;
    }
}
</style>
