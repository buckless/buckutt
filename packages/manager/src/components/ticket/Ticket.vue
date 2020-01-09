<template>
    <div class="ticket">
        <svg
            width="380"
            height="150"
            viewBox="0 0 380 150"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M0 0H380V52C366.469 52 355.5 62.969 355.5 76.5C355.5 90.031 366.469 101 380 101V150H0V95C0 95 11 88.5 11 74C11 59.5 0 54 0 54V0Z"
                fill="rgba(0,0,0,.2)"
            />
            <rect x="24" y="20" width="290" height="110" :fill="rectColor" />
            <line
                x1="340"
                x2="340"
                y2="150"
                stroke="white"
                stroke-width="4"
                stroke-dasharray="12 4"
            />
        </svg>

        <div class="uid">
            {{ uid }}
        </div>
    </div>
</template>

<script>
import theme from 'ui/src/theme.json';

export default {
    name: 'Ticket',

    props: {
        uid: {
            type: String,
            required: true
        }
    },

    data: () => ({
        rectColor: theme.colors.grey['50']
    })
};
</script>

<style scoped>
.ticket {
    position: relative;
    width: 380px;
    height: 150px;
    max-width: 100%;
}

.ticket > svg {
    max-width: 100%;
}

.uid {
    position: absolute;
    top: 50%;
    left: calc(50% - 24px);
    transform: translate(-50%, -50%);

    font-family: monospace;
}
</style>
