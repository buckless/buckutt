<template>
    <ul>
        <li
            v-for="(active, i) in mutableValue"
            @click.stop="toggle(i)"
            :active="active">{{ days[i] }}</li>
    </ul>
</template>

<script>
const daysTrans = {
    Sunday: 'Dim',
    Monday: 'Lun',
    Tuesday: 'Mar',
    Wednesday: 'Mer',
    Thursday: 'Jeu',
    Friday: 'Ven',
    Saturday: 'Sam'
};

export default {
    props: ['value'],

    data() {
        const firstDay = moment(process.env.VUE_APP_CATERING_DAYONE);
        const dayCount = parseInt(process.env.VUE_APP_CATERING_DAYS, 10);

        const days = [];

        for (let i = 0; i < dayCount; ++i) {
            const date = moment(firstDay).add(i, 'day');

            days.push(daysTrans[date.format('dddd')]);
        }

        return {
            // create a data that we can mutate before emitting
            mutableValue: Array.prototype.slice.call(this.value),
            days
        };
    },

    methods: {
        toggle(i) {
            this.mutableValue[i] = !this.mutableValue[i];
            this.$emit('input', this.mutableValue);
            this.$forceUpdate();
        }
    }
};
</script>

<style scoped>
ul {
    display: flex;
    padding: 0;
    list-style: none;
}

li {
    flex: 1;
    padding: 8px 4px;
    color: rgba(32, 32, 32, 0.8);
    background-color: #bdc3c7;
    text-align: center;
    cursor: pointer;
}

li:not(:last-child) {
    border-right: 1px solid #fff;
}

li[active='true'] {
    color: #fff;
    background-color: #1abc9c;
}
</style>
