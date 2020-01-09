<template>
    <div class="physical-card" :active="active">
        <div class="rect">
            <svg
                width="140"
                height="80"
                viewBox="0 0 140 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M70 0L140 40L70 80L0 40L70 0Z" fill="rgba(0,0,0,.2)" />
            </svg>
        </div>
        <div class="infos">
            <div class="uid">{{ uid }}</div>
            <div v-if="amount" class="amount">{{ formattedAmount }}</div>
        </div>
    </div>
</template>

<script>
import { format } from '../../utils/money';

export default {
    name: 'PhysicalCard',

    props: {
        active: {
            type: Boolean,
            default: false
        },

        uid: {
            type: String,
            required: true
        },

        amount: {
            type: Number,
            required: false
        }
    },

    computed: {
        formattedAmount() {
            return format({ amount: this.amount });
        }
    }
};
</script>

<style scoped>
.physical-card {
    display: flex;
    flex-direction: column;
    width: 238px;
    height: 150px;

    background-color: var(--primary-50);
    border-radius: calc(var(--radius) * 2);
    border: 1px solid color-mod(var(--black) a(12%));
    box-shadow: var(--elevation-2dp);
}

.physical-card[active] {
    border: 1px solid var(--accent-300);
    box-shadow: var(--elevation-2dp), inset 0 0 0 2px var(--accent-300);
}

.rect {
    position: relative;
    left: 50%;
    top: 40%;
    width: 140px;
    height: 80px;

    transform: translate(-50%, -50%);
}

.infos {
    display: flex;
    flex: 1;
    padding: 8px 12px;
    align-items: flex-end;
    justify-content: space-between;

    font-family: monospace;
}
</style>
