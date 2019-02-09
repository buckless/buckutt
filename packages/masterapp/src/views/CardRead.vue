<template>
    <div>
        <h2>Lire une carte</h2>
        <div class="resume" v-if="cardData && cardData.credit >= 0">
            <div><strong>Serial id</strong>: {{ cardData.cardId }}</div>
            <div><strong>Serial physique</strong>: {{ cardData.serial }}</div>
            <div><strong>Crédit:</strong> {{ cardData.credit | price(true) }}</div>
            <div><strong>Version de la carte:</strong> {{ cardData.version }}</div>
            <div>
                <strong>Carte assignée</strong>:
                <span v-if="cardData.options.assignedCard">oui</span><span v-else>non</span>
            </div>
            <div>
                <strong>Carte payée</strong>: <span v-if="cardData.options.paidCard">oui</span
                ><span v-else>non</span>
            </div>
            <div>
                <strong>Carte bloquée</strong>: <span v-if="cardData.options.locked">oui</span
                ><span v-else>non</span>
            </div>
            <div>
                <strong>Catering:</strong>
                <div v-for="(item, i) in cardData.options.catering" :key="i">
                    {{ getCateringName(item.id) }} : {{ item.balance }}

                    (<span
                        v-for="(active, day) in getCateringAvail(item.validity)"
                        :key="day"
                        class="day"
                        :active="active"
                    >
                        {{ day }} </span
                    >)
                </div>
            </div>
        </div>
        <CardViewer :pages="pages" class="cardViewer" />
        <nfc
            mode="read"
            @fulldata="onNfcRawData"
            @read="onNfcRead"
            @error="error"
            disableLockCheck
            disableSignCheck
            key="reader"
        />
    </div>
</template>

<script>
import moment from 'moment';
import * as chunk from 'lodash.chunk';

import Nfc from '@/components/Nfc';
import CardViewer from '@/components/CardViewer';
import cards from '@/assets/cards.csv';

window.moment = moment;

const daysTrans = {
    Sunday: 'Dim',
    Monday: 'Lun',
    Tuesday: 'Mar',
    Wednesday: 'Mer',
    Thursday: 'Jeu',
    Friday: 'Ven',
    Saturday: 'Sam'
};

export default {
    components: {
        Nfc,
        CardViewer
    },

    data() {
        return {
            pages: [],
            cardData: {}
        };
    },

    methods: {
        onNfcRead(cardId, credit, options) {
            const serial = (cards.find(map => map.uid === cardId) || { serial: 'introuvable' })
                .serial;

            this.cardData = { cardId, credit, options, serial };
        },

        onNfcRawData(rawData) {
            this.pages = chunk(rawData, 8).map(page => chunk(page, 2));
        },

        error(err) {
            alert('Impossible de lire la carte', err);
        },

        getCateringName(id) {
            try {
                return JSON.parse(process.env.VUE_APP_ARTICLES).find(entry => entry.id === id).name;
            } catch (err) {
                console.log('couldnt find id', id, err);
                return 'Inconnu';
            }
        },

        getCateringAvail(validity) {
            const firstDay = moment(process.env.VUE_APP_CATERING_DAYONE);
            const days = parseInt(process.env.VUE_APP_CATERING_DAYS, 10);

            const avails = {};

            for (let i = 0; i < days; ++i) {
                const date = moment(firstDay).add(i, 'day');

                avails[daysTrans[date.format('dddd')]] = validity[i];
            }

            return avails;
        }
    }
};
</script>

<style scoped>
h2 {
    text-align: center;
}

.cardViewer {
    margin: 1em auto 0 auto;
    padding: 0 12px;
    text-align: justify;
    max-width: 320px;
}

.resume {
    padding: 0 24px;
    line-height: 1.2;
    margin-bottom: 36px;
}

.day {
    color: red;
}

.day[active] {
    color: green;
}

.toggles {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.toggle {
    width: 100%;
    height: 45px;
    margin-top: 12px;
    padding: 12px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px transparent;
}

.toggle[active] {
    height: auto;
    border-color: #1abc9c;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 0 0 2px #1abc9c;
}

.vue-slider-component {
    opacity: 0;
}

.toggle[active] .vue-slider-component {
    opacity: 1;
}
</style>
