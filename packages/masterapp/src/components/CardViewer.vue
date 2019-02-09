<template>
    <div class="container">
        <template v-if="pages.length > 0">
            <div class="cardData">
                <div v-for="(page, i) in pages" class="page" :key="i">
                    <div class="page-indicator">{{ i + 1 }}:</div>
                    <div class="bytes">
                        <mark v-for="(byte, j) in page" :class="getClass(i, j)" :key="j">{{
                            byte.join('')
                        }}</mark>
                    </div>
                </div>
            </div>
            <div class="legend">
                <ul>
                    <li><mark class="byte credit">ff</mark> Crédit</li>
                    <li><mark class="byte version">ff</mark> Version</li>
                    <li><mark class="byte options">ff</mark> Options + catering</li>
                    <li><mark class="byte signature">ff</mark> Signature</li>
                </ul>
            </div>
        </template>
        <template v-else>
            Scannez un support pour lire ses informations
        </template>
    </div>
</template>

<script>
const duration = parseInt(process.env.VUE_APP_CATERING_DAYS, 10);
const articles = Object.values(JSON.parse(process.env.VUE_APP_ARTICLES)).sort(
    (a, b) => a.id - b.id
);

const usefulDataLength = articles.reduce(
    (a, b) => a + b.maxNumber.toString(2).length + duration,
    3
);
const optionsByteNumber = Math.ceil(usefulDataLength / 8);

const bytesOrder = [
    {
        type: 'credit',
        length: 3
    },
    {
        type: 'version',
        length: 2
    },
    {
        type: 'options',
        length: optionsByteNumber
    },
    {
        type: 'signature',
        length: 4
    }
];

const byteClasses = [];

bytesOrder.forEach(entry => {
    for (let i = 0; i < entry.length; i++) {
        byteClasses.push(['byte', entry.type]);
    }
});

export default {
    props: {
        pages: {
            type: Array,
            default: () => []
        }
    },

    data() {
        return {
            byteClasses
        };
    },

    methods: {
        getClass(i, j) {
            const index = i * 4 + j;

            return byteClasses[index] || ['byte', 'none'];
        }
    }
};
</script>

<style scoped>
.container {
    text-align: center;
}

.cardData {
    margin: 0 2em;
}

.page {
    display: flex;
    margin: 9px 0;
}

.page-indicator {
    display: inline-block;
    width: 24px;
}

.legend ul {
    list-style-type: none;
    text-align: left;
    margin-top: 2em;
}

.legend li {
    margin: 1em 0;
}

mark.byte {
    margin: 0 0.25em;
    padding: 0.25em;
}

mark.credit {
    background-color: #2ecc71;
}

mark.version {
    background-color: #d35400;
}

mark.options {
    background-color: #2980b9;
}

mark.signature {
    background-color: #8e44ad;
    color: #fff;
}
</style>
