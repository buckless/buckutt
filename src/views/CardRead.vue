<template>
    <div>
        <h2>Lire une carte</h2>
        <CardViewer :pages="pages" class="cardViewer" />
        <nfc
            mode="read"
            @fulldata="onNfcRawData"
            @read="onNfcRead"
            @error="error"
            key="reader" />
    </div>
</template>

<script>
import Nfc from '@/components/Nfc';
import CardViewer from '@/components/CardViewer';

import * as chunk from 'lodash.chunk';

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
            this.cardData = { cardId, credit, options };
        },

        onNfcRawData(rawData_) {
            console.log('ok', rawData_);
            let rawData = Buffer.from(rawData_)
                .toString('hex')
                .split('');
            this.pages = chunk(rawData, 8).map(page => chunk(page, 2));
            console.log(this.pages);
        },

        error(err) {
            alert('Impossible de lire la carte', err);
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
