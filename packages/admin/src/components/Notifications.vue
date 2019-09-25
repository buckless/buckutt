<template>
    <div class="b-notifications">
        <b-notification v-for="{id, content} in notifications" :key="id" class="b-notification">
            {{ content }}
        </b-notification>
    </div>
</template>


<script>
import { mapState } from 'vuex';

export default {
    computed: mapState({
        notifications: state => state.notifications.messages
    })
};
</script>

<style scoped>
.b-notifications {
    display: flex;
    position: fixed;
    bottom: 24px;
    left: 24px;
    flex-direction: column-reverse;
}

.b-notification {
    margin-top: 10px;
    flex-grow: 0;
}
</style>
