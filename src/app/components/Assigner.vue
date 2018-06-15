<template>
    <div class="b-assigner">
        <div class="b-assigner__home">
            <div class="b-assigner__home__button" :class="scanClasses" @click="barcode">
                <img src="../assets/qrcode.png" height="48" width="48" />
                <h3>Scanner un billet</h3>
            </div>
            <div class="b-assigner__home__spacing"></div>
            <div class="b-assigner__home__button" :class="searchClasses" @click="subpage = 'search'">
                <i class="b-icon">create</i>
                <h3>Recherche manuelle</h3>
            </div>
            <div class="b-assigner__home__spacing"></div>
            <div class="b-assigner__home__button" :class="createClasses" @click="subpage = 'create'">
                <i class="b-icon">person_add</i>
                <h3>Compte anonyme</h3>
            </div>
        </div>
        <create-account v-show="subpage === 'create'" ref="create" @ok="ok"/>
        <search v-show="subpage === 'search'" @assign="assignModal"/>
        <nfc mode="write" @read="assignCard" @cancel="closeModal" v-if="assignModalOpened" disableSignCheck shouldPinLock :shouldPinUnlock="false">
            <p class="b-assigner-modal__modal__text__head">
                <strong>{{ assignModalName }}</strong><br />
                Nom d'utilisateur : <strong>{{ assignModalUsername }}</strong><br/>
                Nouveau crédit : <strong><currency :value="assignModalCredit" /></strong>

                <template v-if="nfcCost.amount > 0">
                    <br /><br />
                    <strong v-if="assignModalCredit < nfcCost.amount">
                        Le compte n'a pas assez de crédit pour payer le support, encaisser <currency :value="nfcCost.amount" />.
                    </strong>
                    <strong v-else>
                        <currency :value="nfcCost.amount" />
                        <template v-if="nfcCost.amount === 100">va être débité</template>
                        <template v-else>vont être débités</template>
                        du compte afin de payer le support
                    </strong>
                </template>

                <h4 v-if="groups.length > 0">Groupes :</h4>
            </p>
            <div class="b-assigner-modal__modal__text__groups" v-if="groups.length > 0">
                <div class="b-assigner-modal__modal__text__groups__group" v-for="group in groups">
                    <input type="checkbox" name="group" class="b--out-of-screen" :id="`chk_${group.id}`" v-model="activeGroups" :value="group">
                    <label :for="`chk_${group.id}`">
                        {{ group.name }}
                    </label>
                </div>
            </div>
        </nfc>
        <ok v-if="showOkModal" @click.native="showOkModal = false"/>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

import barcode from '@/../lib/barcode';
import CreateAccount from './Assigner-CreateAccount';
import Search from './Assigner-Search';
import Ok from './Ok';
import Currency from './Currency';

export default {
    components: {
        CreateAccount,
        Currency,
        Search,
        Ok
    },

    data() {
        return {
            showOkModal: false,
            assignModalCredit: 0,
            assignModalName: '',
            assignModalUsername: '',
            assignModalId: '',
            assignModalOpened: false,
            subpage: 'search',
            activeGroups: [],
            precheckedGroups: []
        };
    },

    computed: {
        scanClasses() {
            return this.subpage === 'scan' ? 'b-assigner__home__button--active' : '';
        },

        searchClasses() {
            return this.subpage === 'search' ? 'b-assigner__home__button--active' : '';
        },

        createClasses() {
            return this.subpage === 'create' ? 'b-assigner__home__button--active' : '';
        },

        barcodeClasses() {
            return this.subpage === 'barcode' ? 'b-assigner__home__button--active' : '';
        },

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
        },

        ...mapState({
            operator: state => state.auth.seller,
            useCardData: state => state.auth.device.event.config.useCardData,
            nfcId: state => state.auth.device.event.nfc_id,
            nfcCosts: state => state.items.nfcCosts,
            defaultGroup: state =>
                state.auth.groups.find(group => group.name === state.auth.device.event.name),
            groups: state =>
                state.auth.groups.filter(group => group.name !== state.auth.device.event.name)
        })
    },

    methods: {
        assignCard(cardId, _, options) {
            this.$store.commit('SET_DATA_LOADED', false);
            const mol = {
                user_id: this.assignModalId,
                type: 'cardId',
                data: cardId,
                blocked: false
            };

            let initialPromise = Promise.resolve();

            if (options.assignedCard) {
                this.$store.commit('SET_DATA_LOADED', true);
                return this.$store.commit('ERROR', { message: 'Card already assigned' });
            }

            const removeOldCards = encodeURIComponent(
                JSON.stringify([
                    { field: 'user_id', eq: this.assignModalId },
                    { field: 'type', eq: 'cardId' },
                    { field: 'data', ne: cardId }
                ])
            );

            const membershipsToAdd = this.activeGroups
                .filter(g => !this.precheckedGroups.some(group => g.id === group.id))
                .map(g => g.id);

            this.sendRequest({
                method: 'put',
                url: `meansoflogin?q=${removeOldCards}`,
                data: {
                    blocked: true
                }
            })
                .then(() =>
                    this.sendRequest({
                        method: 'post',
                        url: 'meansoflogin',
                        data: mol
                    })
                )
                .then(() =>
                    this.sendRequest({
                        method: 'post',
                        url: 'services/assigner/groups',
                        data: {
                            user: this.assignModalId,
                            groups: membershipsToAdd
                        }
                    })
                )
                .then(() => {
                    if (this.nfcCost.amount === 0) {
                        return Promise.resolve();
                    }

                    const localId = `transaction-id-${window.appId}-${Date.now()}`;
                    const transactionToSend = {
                        assignedCard: true,
                        buyer: cardId,
                        molType: config.buyerMeanOfLogin,
                        date: new Date(),
                        basket: [
                            {
                                price_id: this.nfcCost.id,
                                promotion_id: null,
                                articles: [
                                    {
                                        id: this.nfcId,
                                        vat: 0.2,
                                        price: this.nfcCost.id
                                    }
                                ],
                                alcohol: 0,
                                cost: this.nfcCost.amount,
                                type: 'purchase'
                            }
                        ],
                        seller: this.operator.id,
                        localId
                    };

                    return this.sendRequest({
                        method: 'post',
                        url: 'services/basket',
                        data: transactionToSend
                    });
                })
                .catch(
                    err =>
                        err.response.data.message === 'Duplicate Entry'
                            ? Promise.resolve()
                            : Promise.reject(err)
                )
                .then(
                    () =>
                        this.useCardData
                            ? new Promise(resolve => {
                                  const creditToWrite =
                                      this.assignModalCredit < this.nfcCost.amount
                                          ? this.assignModalCredit
                                          : this.assignModalCredit - this.nfcCost.amount;
                                  window.app.$root.$emit('readyToWrite', creditToWrite, {
                                      assignedCard: true,
                                      catering: options.catering
                                  });
                                  window.app.$root.$on('writeCompleted', () => resolve());
                              })
                            : Promise.resolve()
                )
                .then(() => this.ok())
                .catch(err => this.$store.commit('ERROR', err.response.data))
                .then(() => this.$store.commit('SET_DATA_LOADED', true));
        },

        ticketScanned(value) {
            this.$store.commit('SET_DATA_LOADED', false);

            let user = { data: {} };
            const now = new Date();
            const offlineAnswer = window.database
                .findByBarcode(value)
                .then(users => {
                    if (users.length === 1) {
                        user.data = {
                            credit: users[0].credit,
                            name: users[0].name,
                            username: users[0].username,
                            id: users[0].uid
                        };

                        return window.database.userMemberships(user.data.id);
                    }

                    return Promise.resolve([]);
                })
                .then(memberships => {
                    user.data.currentGroups = memberships
                        .filter(
                            membership =>
                                new Date(membership.start) <= now && new Date(membership.end) >= now
                        )
                        .map(membership => ({ id: membership.group }));

                    return user;
                });

            this.sendRequest({
                method: 'post',
                url: `services/assigner`,
                data: { ticketOrMail: value },
                immediate: true,
                offlineAnswer
            })
                .then(res => {
                    if (typeof res.data.credit === 'number') {
                        this.assignModal(
                            res.data.credit,
                            res.data.name,
                            res.data.username,
                            res.data.id,
                            res.data.currentGroups
                        );
                        return;
                    }

                    return this.$store.commit('ERROR', { message: "Couldn't find ticket" });
                })
                .catch(err => {
                    console.error(err);
                    this.$store.commit('ERROR', err.response.data);
                })
                .then(() => this.$store.commit('SET_DATA_LOADED', true));
        },

        closeModal() {
            this.activeGroups = [];
            this.assignModalOpened = false;
            this.assignModalCredit = 0;
            this.assignModalName = '';
            this.assignModalUsername = '';
            this.assignModalId = '';
        },

        onBarcode(value) {
            if (!value) {
                return;
            }

            this.ticketScanned(value);
        },

        assignModal(credit, name, username, id, groups = []) {
            const precheckedGroups = groups.map(group => this.groups.find(g => g.id === group.id));
            this.assignModalOpened = true;
            this.assignModalCredit = credit;
            this.assignModalName = name;
            this.assignModalUsername = username;
            this.assignModalId = id;
            this.activeGroups = precheckedGroups;
            this.precheckedGroups = groups;
        },

        barcode() {
            barcode().then(value => this.onBarcode(value));
        },

        ok() {
            this.showOkModal = true;
            this.closeModal();
        },

        ...mapActions(['sendRequest'])
    },

    mounted() {
        window.mock.barcode = b => this.onBarcode(b);
    }
};
</script>

<style scoped>
.b-assigner {
    display: flex;
    flex: 1;
    flex-direction: column;
}

.b-assigner__home {
    display: flex;
    flex-wrap: wrap;
    min-height: 170px;
    padding: 10px;

    background-color: #f3f3f3;
}

.b-assigner__home__spacing {
    width: 10px;
}

.b-assigner__home__button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    flex: 1;
    height: 150px;
    padding: 5px;

    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    cursor: pointer;
    text-align: center;

    &.b-assigner__home__button--active {
        border: 3px solid #2980b9;
    }

    & > i {
        color: #2980b9;
        font-size: 48px;
    }

    & > h3 {
        margin: 10px 0 0 0;
        text-transform: uppercase;
        color: rgba(0, 0, 0, 0.6);
    }
}

.b-assigner-modal__modal__text__head {
    padding: 0px 10px;
}

.b-assigner-modal__modal__text__groups {
    margin-top: -15px;
    background: #fff;
    border-radius: 3px;
}

.b-assigner-modal__modal__text__groups__group {
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

@media (max-width: 768px) {
    .b-assigner__home {
        min-height: 140px;
    }

    .b-assigner__home__button {
        height: 120px;
    }

    .b-assigner__home__button > h3 {
        font-size: 14px;
    }
}
</style>
