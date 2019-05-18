<template>
    <div class="b-assigner-scan">
        <video ref="preview"></video>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import Instascan from 'instascan';

export default {
    methods: mapActions(['sendRequest']),

    computed: mapState({
        useCardData: state => state.auth.device.event.config.useCardData
    }),

    mounted() {
        this.scanner = new Instascan.Scanner({
            video: this.$refs.preview,
            mirror: false,
            scanPeriod: 5
        });

        this.scannerListener = qrcode => {
            this.$store.commit('SET_DATA_LOADED', false);
            return this.sendRequest({
                url: `auth/assigner?ticketNumber=${qrcode}`,
                noQueue: true,
                forceOffline: this.useCardData,
                offlineAnswer: window.database.findByBarcode(qrcode).then(tickets => ({
                    data: tickets
                }))
            })
                .then(res => {
                    const ticket = res.data[0];

                    this.$emit(
                        'assign',
                        ticket.credit,
                        ticket.name,
                        ticket.id,
                        ticket.currentGroups,
                        ticket.barcode,
                        ticket.ticketId,
                        ticket.walletId,
                        ticket.validation
                    );
                })
                .catch(err => {
                    this.$store.commit('SET_DATA_LOADED', true);
                    console.log(err);
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
