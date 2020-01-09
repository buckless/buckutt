<template>
    <div class="container">
        <Notification
            class="notification"
            :key="notification.id"
            v-for="notification in notifications"
        >
            {{ notification.message }}
        </Notification>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

import Notification from 'ui/src/components/Notification/Notification';

export default {
    components: {
        Notification
    },

    computed: {
        ...mapGetters({
            notifications: 'notifications/getNotifications'
        })
    }
};
</script>

<style scoped>
.container {
    position: absolute;
    bottom: 24px;
    left: 24px;
}

.notification {
    min-width: 150px;
}

.notification:not(:last-child) {
    margin-bottom: 16px;
}
</style>
