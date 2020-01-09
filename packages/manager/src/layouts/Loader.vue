<template>
    <div class="container">
        <div class="progress-bar">
            <div class="progress" />
        </div>
    </div>
</template>

<script>
import { mapMutations } from 'vuex';
import { api } from '../api';

export default {
    methods: mapMutations({
        setEvent: 'infos/SET_EVENT'
    }),

    async mounted() {
        try {
            const { data } = await api.get('auth/event');
            const { style, event } = data;

            for (const [themeVar, value] of Object.entries(style)) {
                document.documentElement.style.setProperty(`--${themeVar}`, value);
            }

            await this.setEvent(event);
        } catch (err) {
            // eslint-disable-next-line no-console
            console.log(err);
        }

        this.$emit('loaded');
    }
};
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
    background-color: var(--grey-600);
}

.progress-bar {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 6px;
    width: 180px;
    transform: translate(-50%, -50%);
    background-color: color-mod(var(--black) a(0.06));
    border-radius: 3px;
    overflow: hidden;
}

.progress {
    height: 100%;
    width: 50px;
    background-color: var(--primary-300);
    border-radius: 3px;

    animation: loader 2s infinite;
}

@keyframes loader {
    0% {
        transform: translateX(0);
    }

    50% {
        transform: translateX(130px);
    }

    0% {
        transform: translateX(0);
    }
}
</style>
