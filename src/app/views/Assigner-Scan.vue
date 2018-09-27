<template>
    <div class="b-assigner-scan">
        <video ref="preview"></video>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import Instascan from 'instascan';
import formatOfflineResults from '@/utils/formatOfflineResults';

export default {
    data() {
        return {};
    },

    methods: {
        ...mapActions(['sendRequest'])
    },

    mounted() {
        this.scanner = new Instascan.Scanner({
            video: this.$refs.preview,
            mirror: false,
            scanPeriod: 5
        });

        this.scannerListener = qrcode => {
            this.$store.commit('SET_DATA_LOADED', false);
            return this.sendRequest({
                url: `services/assigner?ticketOrMail=${qrcode}`,
                noQueue: true,
                offlineAnswer: window.database
                    .findByBarcode(qrcode)
                    .then(users => formatOfflineResults(users))
            })
                .then(res => {
                    const user = res.data[0];

                    if (!user) {
                        return Promise.reject({ response: { data: 'Barcode not found' } });
                    }

                    if (user.firstname) {
                        user.name = `${user.firstname} ${user.lastname}`;
                    }

                    if (user.memberships) {
                        user.currentGroups = user.memberships.map(membership => ({
                            id: membership.group_id
                        }));
                    }

                    this.$emit(
                        'assign',
                        user.credit,
                        user.name,
                        user.username,
                        user.id,
                        user.currentGroups,
                        user.ticketId || qrcode,
                        user.molId
                    );
                })
                .catch(err => {
                    this.$store.commit('SET_DATA_LOADED', true);
                    this.$store.commit('ERROR', { message: err.response.data });
                });
        };

        this.scanner.addListener('scan', this.scannerListener);

        Instascan.Camera.getCameras().then(cameras => {
            console.log(cameras);
            if (cameras.length > 0) {
                this.scanner.start(cameras[cameras.length - 1]);
            }
        });
    },

    beforeDestroy() {
        this.scanner.stop();
        this.scanner.removeListener('scan', this.scannerListener);
    }
};
</script>

<style scoped>
@import '../main.css';

.b-assigner-scan {
    background-color: #f3f3f3;
    flex: 1;
    max-width: 100%;
    max-height: calc(100% - 40px);
}

video {
    width: 90%;
    height: 90%;
    margin-left: 5%;
    margin-top: 5%;
}
</style>
