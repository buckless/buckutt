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
        <nfc mode="write" @read="assignCard" @cancel="closeModal" v-if="assignModalOpened" disableSignCheck>
            <strong>{{ assignModalName }}</strong><br />
            Nom d'utilisateur : <strong>{{ assignModalUsername }}</strong><br/>
            Nouveau crédit : <strong><currency :value="assignModalCredit" /></strong>

            <template v-if="cardCost > 0">
                <strong v-if="!assignModalHasPaidCard">
                    Support non pré-payé, débiter <currency :value="cardCost" />
                </strong>
                <em v-else>Support prépayé</em>
            </template>

            <h4 v-if="groups.length > 0">Groupes :</h4>
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
import axios from '@/utils/axios';
import { mapGetters, mapState, mapActions } from 'vuex';

import barcode from '@/../lib/barcode';
import OfflineData from '@/../lib/offlineData';
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
            db: null,
            showOkModal: false,
            assignModalCredit: 0,
            assignModalName: '',
            assignModalUsername: '',
            assignModalId: '',
            assignModalHasPaidCard: false,
            assignModalOpened: false,
            subpage: 'search',
            activeGroups: []
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

        ...mapState({
            online: state => state.online.status,
            useCardData: state => state.auth.device.event.config.useCardData,
            cardCost: state => state.auth.device.event.config.cardCost,
            groups: state =>
                state.auth.groups.filter(group => group.name !== state.auth.device.event.name)
        }),

        ...mapGetters(['tokenHeaders'])
    },

    methods: {
        assignCard(value) {
            this.$store.commit('SET_DATA_LOADED', false);
            const mol = {
                user_id: this.assignModalId,
                type: 'cardId',
                data: value,
                blocked: false
            };

            let initialPromise = Promise.resolve();

            if (this.online) {
                initialPromise = initialPromise
                    .then(() => axios.post(`${config.api}/meansoflogin`, mol, this.tokenHeaders))
                    .then(() =>
                        axios.post(
                            `${config.api}/services/assigner/groups`,
                            {
                                user: this.assignModalId,
                                groups: this.activeGroups.map(g => g.id)
                            },
                            this.tokenHeaders
                        )
                    )
                    .then(() =>
                        axios.put(
                            `${config.api}/users/${this.assignModalId}`,
                            {
                                hasPaidCard: false
                            }
                        )
                    )
            } else {
                initialPromise = initialPromise
                    .then(() =>
                        this.addPendingRequest({
                            url: `${config.api}/meansoflogin`,
                            body: mol
                        })
                    )
                    .then(() =>
                        this.addPendingRequest({
                            url: `${config.api}/services/assigner/groups`,
                            body: {
                                user: this.assignModalId,
                                groups: this.activeGroups.map(g => g.id)
                            }
                        })
                    )
                    .then(() =>
                        this.addPendingRequest({
                            method: 'put',
                            url: `${config.api}/users/${this.assignModalId}`,
                            body: {
                                hasPaidCard: false
                            }
                        })
                    )
            }

            initialPromise
                .then(() => Promise.resolve(true))
                .catch(
                    err =>
                        err.response.data.message === 'Duplicate Entry'
                            ? Promise.resolve(true)
                            : Promise.reject(err)
                )
                .then(
                    write =>
                        write && this.useCardData
                            ? new Promise(resolve => {
                                  window.app.$root.$emit('readyToWrite', this.assignModalCredit);
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
            if (this.online) {
                axios
                    .get(`${config.api}/services/assigner?ticketOrMail=${value}`, this.tokenHeaders)
                    .then(res => {
                        if (typeof res.data.credit === 'number') {
                            this.assignModal(res.data.credit, res.data.name, res.data.username, res.data.id, res.data.hasPaidCard);
                            return;
                        }

                        return this.$store.commit('ERROR', { message: "Couldn't find ticket" });
                    })
                    .catch(err => {
                        console.error(err);
                        this.$store.commit('ERROR', err.response.data);
                    })
                    .then(() => this.$store.commit('SET_DATA_LOADED', true));
            } else {
                this.db
                    .findByBarcode(value)
                    .then(users => {
                        if (users.length === 1) {
                            this.assignModal(users[0].credit, users[0].name, users[0].username, users[0].id, users[0].hasPaidCard);
                            return;
                        }

                        return this.$store.commit('ERROR', { message: "Couldn't find ticket" });
                    })
                    .then(() => this.$store.commit('SET_DATA_LOADED', true));
            }
        },

        closeModal() {
            this.activeGroups = [];
            this.assignModalOpened = false;
            this.assignModalCredit = 0;
            this.assignModalName = '';
            this.assignModalUsername = '';
            this.assignModalId = '';
        },

        onBarcode(value, isFromBarcode) {
            if (!value) {
                return;
            }

            if (this.subpage === 'create') {
                this.$refs.create.assignCard(value);
                return;
            }

            if (this.assignModalOpened) {
                this.assignCard(value);
                return;
            }

            if (isFromBarcode) {
                this.ticketScanned(value);
            }
        },

        assignModal(credit, name, username, id, hasPaidCard) {
            this.assignModalOpened = true;
            this.assignModalCredit = credit;
            this.assignModalName = name;
            this.assignModalUsername = username;
            this.assignModalId = id;
            this.assignModalHasPaidCard = hasPaidCard;
        },

        barcode() {
            barcode().then(value => this.onBarcode(value, true));
        },

        ok() {
            this.showOkModal = true;
            this.closeModal();
        },

        ...mapActions(['addPendingRequest', 'updateEssentials'])
    },

    mounted() {
        this.db = new OfflineData();
        this.db.init();

        window.mock.barcode = b => this.onBarcode(b, true);
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
