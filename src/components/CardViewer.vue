<template>
<div class="container">
        <template v-if="pages.length > 0">
            <div class="cardData">
                <div v-for="(page, i) in pages" class="page" :key="i">
                    <div class="page-indicator">Page {{ i+1 }}:</div>
                    <div class="bytes">
                        <mark v-for="(byte, j) in page" :class="byteClasses[i][j]" :key="j">{{ byte.join('') }}</mark>
                    </div>
                </div>
            </div>
            <div class="legend">
                <ul>
                    <li><mark class="byte credit">ff</mark> Crédit</li>
                    <li><mark class="byte options">ff</mark> Options </li>
                    <li><mark class="byte catering">ff</mark> Catering </li>
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
const byteClasses = [
    [['byte', 'credit'], ['byte', 'credit'], ['byte', 'credit'], ['byte', 'options']],
    [['byte', 'catering'], ['byte', 'catering'], ['byte', 'signature'], ['byte', 'signature']],
    [['byte', 'signature'], ['byte', 'signature']]
];

export default {
    props: {
        pages: {
            type: Array,
            default: []
        }
    },

    data() {
        return {
            byteClasses
        };
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

.page-indicator {
    margin: 1em 0;
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
    background-color: tomato;
}

mark.options {
    background-color: rebeccapurple;
}

mark.catering {
    background-color: darkgreen;
}

mark.signature {
    background-color: aqua;
}
</style>
