<template>
    <div class="b-controller">
        <chooser v-if="chooser" @groups="setGroups" @cancel="chooser = false" :defaultGroups="currentGroups"/>
        <button @click="chooser = true">Changer de groupe(s)</button>
        <p>
            <strong>Groupe(s) actuel(s)</strong> :
            <br/>
            <span class="b-controller-group" v-for="group in currentGroups" :key="group.id">{{ group.name }}</span>
            <span v-if="currentGroups.length === 0">Aucun groupe sélectionné</span>
            <br/>
            <br/>
            <br/>
            Scannez une carte pour vérifier son accès
            <nfc mode="read" @read="onCard" />
        </p>
        <ok v-if="showOkModal" :status="okModalStatus" @click.native="showOkModal = false"/>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Chooser from './Controller-Chooser';
import Ok from '@/components/Ok';

export default {
    components: {
        Ok,
        Chooser
    },

    data() {
        return {
            showOkModal: false,
            okModalStatus: null,
            chooser: false,
            currentGroups: []
        };
    },

    computed: {
        ...mapState({
            wiket: state => state.auth.device.wiket,
            seller: state => state.auth.seller.id
        })
    },

    methods: {
        setGroups(groups) {
            this.currentGroups = groups;
            this.chooser = false;
        },

        onCard(cardId) {
            this.sendRequest({
                url: `customer/controller?user=${cardId}`,
                noQueue: true,
                forceOffline: this.useCardData,
                offlineAnswer: window.database.cardAccesses(cardId)
            })
                .then(res => res.data || res)
                .then(accesses => {
                    let match = false;

                    for (let i = accesses.length - 1; i >= 0; i--) {
                        // check if group matches one of currentGroups
                        if (!this.currentGroups.find(group => group.id === accesses[i].groupId)) {
                            console.log('not one of current groups');
                            continue;
                        }

                        const now = new Date();
                        const start = new Date(accesses[i].start);
                        const end = new Date(accesses[i].end);

                        // check if now is between [start, end]
                        if (now - start >= 0 && end - now >= 0) {
                            match = true;
                        }
                    }

                    if (match) {
                        const access = {
                            operator_id: this.seller,
                            wiket_id: this.wiket,
                            cardId
                        };

                        this.sendRequest({
                            method: 'post',
                            url: 'customer/controller',
                            data: access
                        });
                    }

                    this.okModalStatus = match;
                    this.showOkModal = true;
                });
        },

        ...mapActions(['updateEssentials', 'sendRequest'])
    }
};
</script>

<style>
@import '../main.css';

.b-controller {
    width: 100%;
    background-color: #fafafa;
    text-align: center;
}

.b-controller button {
    margin: 32px 0 18px 0;
    background-color: $lightblue;
    color: #fff;
    cursor: pointer;
    padding: 12px 20px;
    border: 0;
    text-transform: uppercase;
    border-radius: 3px;
}

.b-controller p {
    margin-top: 0;
    padding: 0 18px;
}

.b-controller-group:not(:last-of-type):after {
    content: ', ';
}
</style>
