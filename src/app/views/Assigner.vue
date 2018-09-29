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
        <nfc mode="write" @read="assignCard" @cancel="closeModal" v-if="assignModal.opened" disableSignCheck>
            <div class="b-assigner-modal__modal__text__head" v-if="assignModal.blank">
                <strong>Compte anonyme</strong>

                <h4 v-if="groups.length > 0">Groupes :</h4>
            </div>
            <div class="b-assigner-modal__modal__text__head" v-else>
                <strong>{{ assignModal.name }}</strong><br />
                Nom d'utilisateur : <strong>{{ assignModal.username }}</strong><br/>
                Nouveau crédit : <strong><currency :value="assignModal.credit" /></strong>

                <h4 v-if="groups.length > 0">Groupes :</h4>
            </div>
            <div class="b-assigner-modal__modal__text__groups" v-if="groups.length > 0">
                <div class="b-assigner-modal__modal__text__groups__group" v-for="group in groups" :key="group.id">
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
import { formatMemberships } from '@/utils/formatOfflineResults';

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
        })
    },

    methods: {
        toggleSearch() {
            this.$router.push('/assigner/search');
        },

        toggleScan() {
            this.$router.push('/assigner/scan');
        },

        getPendingCardUpdates(userId) {
            return window.database.pendingUserUpdates(userId.trim()).then(pendingCardUpdates => {
                let amount = 0;
                let version = 0;

                pendingCardUpdates.sort((a, b) => a.incrId - b.incrId).forEach(pcu => {
                    amount += pcu.amount;
                    version = parseInt(pcu.incrId);
                });

                return {
                    amount,
                    version,
                    pendingCardUpdates
                };
            });
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
                      window.app.$root.$emit(
                          'readyToWrite',
                          this.assignModal.credit,
                          {
                              assignedCard: true,
                              catering: options.catering
                          },
                          this.assignModal.version
                      );
                      window.app.$root.$on('writeCompleted', () => resolve());
                  })
                : Promise.resolve();

            const groups = this.activeGroups
                .filter(g => !this.precheckedGroups.some(group => g.id === group.id))
                .map(g => g.id);

            assignPromise
                .then(() => {
                    const requests = [];

                    const data = this.assignModal.blank
                        ? { anon: true, groups, cardId }
                        : {
                              userId: this.assignModal.id,
                              ticketNumber: this.assignModal.ticketId,
                              groups,
                              cardId
                          };

                    requests.push(
                        this.sendRequest({
                            method: 'post',
                            url: 'services/manager/assigner',
                            data,
                            immediate: true
                        })
                    );

                    this.assignModal.pendingCardUpdates.forEach(pcu => {
                        requests.push(
                            this.sendRequest({
                                method: 'post',
                                url: 'services/pendingCardUpdate',
                                data: {
                                    id: pcu.id
                                },
                                immediate: true
                            })
                        );
                    });

                    if (this.assignModal.molId) {
                        requests.push(window.database.delete('tickets', this.assignModal.molId));
                    }

                    return Promise.all(requests);
                })
                .then(() => this.ok())
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
                pendingCardUpdates: [],
                blank: true
            };
        },

        async setAssignModal(credit, name, username, id, groups = [], ticketId, molId) {
            if (!groups) {
                groups = await formatMemberships(id);
            }

            const precheckedGroups = groups
                .filter(group => group.id !== this.defaultGroup.id)
                .map(group => this.groups.find(g => g.id === group.id));

            let pendingPromise = Promise.resolve({ amount: 0, version: 0, ids: [] });
            if (id) {
                pendingPromise = this.getPendingCardUpdates(id);
            }

            return pendingPromise
                .then(({ amount, version, pendingCardUpdates }) => {
                    this.assignModal = {
                        opened: true,
                        credit: credit + amount,
                        name,
                        username,
                        id,
                        ticketId,
                        pendingCardUpdates,
                        version,
                        molId
                    };
                    this.activeGroups = precheckedGroups;
                    this.precheckedGroups = groups;
                })
                .catch(() => Promise.resolve())
                .then(() => this.$store.commit('SET_DATA_LOADED', true));
        },

        ok() {
            this.showOkModal = true;
            this.closeModal();
        },

        ...mapActions(['sendRequest'])
    },

    mounted() {}
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
</style>
