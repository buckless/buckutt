import Vue from 'vue';

export function formatDate(date) {
    const dateJs = new Date(date);

    const day = `0${dateJs.getDate()}`.slice(-2);
    const month = `0${dateJs.getMonth() + 1}`.slice(-2);
    const year = dateJs.getFullYear();

    const hour = `0${dateJs.getHours()}`.slice(-2);
    const minutes = `0${dateJs.getMinutes()}`.slice(-2);

    return `${day}/${month}/${year} ${hour}:${minutes}`;
}

Vue.filter('date', date => formatDate(date));
