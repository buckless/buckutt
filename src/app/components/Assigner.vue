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
        <search v-show="subpage === 'search'" @assign="setAssignModal"/>
        <nfc mode="write" @read="assignCard" @cancel="closeModal" v-if="assignModal.opened" disableSignCheck shouldPinLock :shouldPinUnlock="false">
            <p class="b-assigner-modal__modal__text__head">
                <strong>{{ assignModal.name }}</strong><br />
                Nom d'utilisateur : <strong>{{ assignModal.username }}</strong><br/>
                Nouveau crédit : <strong><currency :value="assignModal.credit" /></strong>

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
import formatOfflineResults from '@/utils/formatOfflineResults';
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
            assignModal: { opened: false },
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

        ...mapState({
            operator: state => state.auth.seller,
            useCardData: state => state.auth.device.event.config.useCardData,
            defaultGroup: state =>
                state.auth.groups.find(
                    group => group.id === state.auth.device.event.defaultGroup_id
                ),
            groups: state =>
                state.auth.groups.filter(
                    group => group.id !== state.auth.device.event.defaultGroup_id
                )
        })
    },

    methods: {
        assignCard(cardId, _, options) {
            this.$store.commit('SET_DATA_LOADED', false);

            if (options.assignedCard) {
                this.$store.commit('SET_DATA_LOADED', true);
                return this.$store.commit('ERROR', { message: 'Card already assigned' });
            }

            const assignPromise = this.useCardData
                ? new Promise(resolve => {
                      window.app.$root.$emit('readyToWrite', this.assignModal.credit, {
                          assignedCard: true,
                          catering: options.catering
                      });
                      window.app.$root.$on('writeCompleted', () => resolve());
                  })
                : Promise.resolve();

            const groupsToAdd = this.activeGroups
                .filter(g => !this.precheckedGroups.some(group => g.id === group.id))
                .map(g => g.id);

            assignPromise
                .then(() =>
                    this.sendRequest({
                        method: 'post',
                        url: 'services/manager/assigner',
                        data: {
                            userId: this.assignModal.id,
                            ticketNumber: this.assignModal.ticketId,
                            groups: groupsToAdd,
                            cardId
                        }
                    })
                )
                .then(() => this.ok())
                .catch(err => this.$store.commit('ERROR', err.response.data))
                .then(() => this.$store.commit('SET_DATA_LOADED', true));
        },

        ticketScanned(value) {
            this.$store.commit('SET_DATA_LOADED', false);

            this.sendRequest({
                url: `services/assigner?ticketOrMail=${value}`,
                noQueue: true,
                offlineAnswer: window.database
                    .findByBarcode(this.searchInput)
                    .then(users => formatOfflineResults(users))
            })
                .then(res => (res.data.length > 0 ? res.data[0] : {}))
                .then(user => {
                    if (typeof user.credit === 'number') {
                        this.setAssignModal(
                            user.credit,
                            user.name || `${user.firstname} ${user.lastname}`,
                            user.username,
                            user.id,
                            user.currentGroups,
                            value
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
            this.assignModal = { opened: false };
        },

        onBarcode(value) {
            if (!value) {
                return;
            }

            this.ticketScanned(value);
        },

        setAssignModal(credit, name, username, id, groups = [], ticketId) {
            const precheckedGroups = groups
                .filter(group => group.id !== this.defaultGroup.id)
                .map(group => this.groups.find(g => g.id === group.id));

            this.assignModal = {
                opened: true,
                credit,
                name,
                username,
                id,
                ticketId
            };
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
