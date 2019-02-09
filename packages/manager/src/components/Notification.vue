<template>
    <div class="notifications">
        <div v-for="message in messages" :key="message.id" class="notification-wrapper">
            <div class="notification">
                {{ message.message }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name: 'Notification',

    computed: {
        ...mapGetters({
            messages: 'notifications/messages'
        })
    },

    updated() {
        requestAnimationFrame(() => {
            Array.from(this.$el.children).forEach(el =>
                el.children[0].classList.add('notification--active')
            );
        });
    }
};
</script>

<style lang="scss" scoped>
@import '@/theme.scss';

.notifications {
    display: flex;
    position: fixed;
    bottom: 24px;
    left: 24px;
    flex-direction: column-reverse;
}

.notification-wrapper:not(:first-child) {
    margin-bottom: 0.5rem;
}

.notification {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    padding-right: 24px;
    padding-left: 24px;
    transition: 0.25s ease transform;
    background-color: $cardBackground;
    pointer-events: none;
    will-change: transform;
    height: 48px;
    color: $foreground;
    transform: translate(calc(-1 * (200% + 24px)));

    @media (max-width: $break-md) {
        border-radius: 2px;
    }
}

.notification--active {
    transform: translate(0);
}
</style>
