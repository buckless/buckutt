<template>
    <div class="b-health-list">
        <div
            class="b-health-alert"
            v-for="healthAlert in healthAlerts"
            :key="healthAlert.id"
        >
            <div>
                <h3>Point : {{ healthAlert.location }}</h3>
                <table>
                    <tbody>
                        <tr>
                            <td>Personnes</td>
                            <td>{{ healthAlert.people }}</td>
                        </tr>
                        <tr>
                            <td>Malaise/Alcool</td>
                            <td>{{ healthAlert.notAlcohol ? 'Non': 'Oui' }}</td>
                        </tr>
                        <tr>
                            <td>Sang</td>
                            <td>{{ healthAlert.blood ? 'Oui': 'Non' }}</td>
                        </tr>
                        <tr>
                            <td>Yeux ouverts</td>
                            <td>{{ healthAlert.closedEyes ? 'Oui': 'Non' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <button @click.prevent="closeHealthAlert(healthAlert.id)">Traité</button>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
    computed: {
        ...mapState({
            healthAlerts: state => state.healthAlerts.alerts.filter(a => a.active)
        })
    },

    methods: {
        ...mapActions(['listHealthAlerts', 'closeHealthAlert'])
    },

    mounted() {
        this.listHealthAlerts();
    }
};
</script>

<style scoped>
@import '../main.css';

.b-health-alert {
    display: flex;
    align-items: center;
    background-color: #fff;
    max-width: 500px;
    margin: 10px auto;
    padding: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    & > :first-child {
        flex: 1;
    }
}

h3 {
    margin: 0 0 5px 0;
}

table {
    border-spacing: 0 2px;
}

td {
    padding: 0;

    &:last-of-type {
        padding: 0 0 0 10px;
    }
}

button {
    background-color: $green;
    border: 0;
    color: #fff;
    padding: 4px;
    min-width: 80px;
    border-radius: 3px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);

    &:focus {
        outline: 0;
    }
}

@media (max-width: 768px) {
    .b-health-alert {
        max-width: 340px;
    }
}
</style>
