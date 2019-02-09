<template>
    <div class="options">
        <h2>Supprimer le code PIN</h2>
        <p>Scannez une carte</p>

        <label for="unlockpin">Code PIN :</label>
        <input type="text" v-model="pin" id="unlockpin">

        <nfc
            mode="read"
            @read="unlock"
            successText="Carte débloquée"
            key="unlock"
            disableLockCheck
            disableSignCheck />
    </div>
</template>

<script>
import Nfc from '@/components/Nfc';

export default {
    components: {
        Nfc
    },

    data() {
        return {
            pin: process.env.VUE_APP_PIN
        };
    },

    methods: {
        unlock() {
            window.mifare.unlock(
                parseInt(this.pin),
                () => {
                    console.log('unlocked');

                    window.mifare.write(
                        0x10,
                        ['00', '00', '00', 'FF'],
                        res => alert('Carte débloquée'),
                        err => alert('Erreur :' + err)
                    );
                },
                err => alert('PIN est faux')
            );
        }
    }
};
</script>

<style scoped>
h2 {
    text-align: center;
}

p {
    margin: 1em auto 0 auto;
    padding: 0 12px;
    text-align: justify;
    max-width: 320px;
}

input {
    padding: 6px;
    font-size: 18px;
    margin: 12px auto;
    display: block;
}
</style>
