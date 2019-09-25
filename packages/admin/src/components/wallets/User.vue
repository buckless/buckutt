<script>
import { mapGetters } from 'vuex';

export default {
    computed: mapGetters(['focusedElements']),

    created() {
        this.$router.push(`/users/${this.focusedElements[0].user_id}`);
    }
};
</script>
