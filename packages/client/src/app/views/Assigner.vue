<template>
    <div class="b-assigner">
        <div class="b-assigner__home">
            <div class="b-assigner__home__button" :class="scanClasses" @click="toggleScan">
                <h3>Scan</h3>
            </div>
            <div class="b-assigner__home__button" :class="searchClasses" @click="toggleSearch">
                <h3>Recherche</h3>
            </div>
        </div>
        <router-view @ok="ok" @assign="setAssignModal" @blankCard="setBlankCard" />
        <nfc mode="write" @read="assignCard" @cancel="closeModal" v-if="assignModal.opened">
            <div class="b-assigner-modal__modal__text__head" v-if="assignModal.blank">
                <strong>Compte anonyme</strong>

                <h4 v-if="groups.length > 0">Groupes :</h4>
            </div>
            <div class="b-assigner-modal__modal__text__head" v-else>
                <strong>{{ assignModal.name }}</strong
                ><br />
                Crédit préchargé : <strong><currency :value="assignModal.credit"/></strong>

                <h4 v-if="groups.length > 0">Groupes :</h4>
            </div>
            <div class="b-assigner-modal__modal__text__groups" v-if="groups.length > 0">
                <div
                    class="b-assigner-modal__modal__text__groups__group"
                    v-for="group in groups"
                    :key="group.id"
                >
                    <input
                        type="checkbox"
                        name="group"
                        class="b--out-of-screen"
                        :id="`chk_${group.id}`"
                        v-model="activeGroups"
                        :value="group"
                    />
                    <label :for="`chk_${group.id}`">
                        {{ group.name }}
                    </label>
                </div>
            </div>
            <div v-if="!assignModal.blank">
                <button
                    @click="validateTicket"
                    class="b-assigner__modal__close b-alert__modal__close--active"
                    v-if="!assignModal.validation"
                >
                    Valider sans associer
                </button>
                <button class="b-assigner__modal__close" v-else>
                    Billet déjà validé ({{ validationDate }})
                </button>
            </div>
        </nfc>
        <ok v-if="showOkModal" @click.native="showOkModal = false" />
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { formatMemberships } from '@/utils/formatOfflineResults';
import shortDate from '@/utils/shortDate';

import Ok from '@/components/Ok';
import Currency from '@/components/Currency';

export default {
    components: {
        Currency,
        Ok
    },

    data() {
        return {
            showOkModal: false,
            assignModal: { opened: false },
            activeGroups: [],
            precheckedGroups: []
        };
    },

    computed: {
        scanClasses() {
            return this.$route.path === '/assigner/scan' ? 'b-assigner__home__button--active' : '';
        },

        searchClasses() {
            return this.$route.path === '/assigner' || this.$route.path === '/assigner/search'
                ? 'b-assigner__home__button--active'
                : '';
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
        }),

        validationDate() {
            if (!this.assignModal.validation) {
                return;
            }

            return shortDate(this.assignModal.validation);
        }
    },

    methods: {
        toggleSearch() {
            this.$router.push('/assigner/search');
        },

        toggleScan() {
            this.$router.push('/assigner/scan');
        },

        validateTicket() {
            if (this.assignModal.barcode && !this.assignModal.validation) {
                this.sendRequest({
                    method: 'post',
                    url: 'auth/validateTicket',
                    data: {
                        ticketNumber: this.assignModal.barcode
                    },
                    immediate: true
                });

                window.database.validateTicket(this.assignModal.id);
            }

            return this.ok();
        },

        assignCard(cardId, _, options) {
            this.$store.commit('SET_DATA_LOADED', false);

            if (options.assignedCard) {
                this.$store.commit('SET_DATA_LOADED', true);
                return this.$store.commit('ERROR', {
                    message: 'Card already assigned'
                });
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

            const groups = this.activeGroups
                .filter(g => !this.precheckedGroups.some(group => g.id === group.id))
                .map(g => g.id);

            assignPromise
                .then(() => this.validateTicket())
                .then(() => {
                    const data = {
                        walletId: this.assignModal.walletId,
                        logicalId: cardId,
                        groups,
                        ticketNumber: this.assignModal.ticketId
                            ? this.assignModal.barcode
                            : undefined,
                        writtenCredit: this.assignModal.credit
                    };

                    return this.sendRequest({
                        method: 'post',
                        url: 'auth/assigner',
                        data,
                        immediate: true
                    });
                })
                .then(() => window.database.delete('tickets', this.assignModal.id))
                .then(() => this.validateTicket())
                .catch(err => {
                    console.log(err);
                    this.$store.commit('ERROR', err.response.data);
                })
                .then(() => this.$store.commit('SET_DATA_LOADED', true));
        },

        closeModal() {
            this.activeGroups = [];
            this.assignModal = { opened: false };
        },

        setBlankCard() {
            this.assignModal = {
                opened: true,
                credit: 0,
                blank: true
            };
        },

        async setAssignModal(
            credit,
            name,
            id,
            groups = [],
            barcode,
            ticketId,
            walletId,
            validation
        ) {
            if (!groups) {
                groups = walletId ? await formatMemberships(walletId) : [];
            }

            const precheckedGroups = groups
                .filter(group => group.id !== this.defaultGroup.id)
                .map(group => this.groups.find(g => g.id === group.id));

            this.assignModal = {
                opened: true,
                credit,
                name,
                id,
                barcode,
                walletId,
                ticketId,
                validation
            };
            this.activeGroups = precheckedGroups;
            this.precheckedGroups = groups;

            this.$store.commit('SET_DATA_LOADED', true);
        },

        ok() {
            this.showOkModal = true;
            this.closeModal();
        },

        ...mapActions(['sendRequest'])
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
    min-height: 40px;

    background-color: #f3f3f3;
}

.b-assigner__home__button {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    flex: 1;
    height: 40px;
    padding: 5px;

    background-color: #fff;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    text-align: center;

    &.b-assigner__home__button--active {
        border-bottom: 2px solid #2980b9;
    }

    & > i {
        color: #2980b9;
        font-size: 48px;
    }

    & > h3 {
        text-transform: uppercase;
        color: rgba(0, 0, 0, 0.6);
        position: relative;
        font-size: 14px;
        top: 2px;
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

.b-assigner__modal__close {
    background-color: #95a5a6;
    border: 0;
    color: #fff;
    cursor: pointer;
    font-weight: bold;
    height: 36px;
    margin-top: 1em;
    padding: 0 16px;
    pointer-events: none;
    border-radius: 2px;
    font-size: 14px;
    text-transform: uppercase;
    width: 100%;

    &.b-alert__modal__close--active {
        pointer-events: all;
        background-color: #e74c3c;
    }
}
</style>
