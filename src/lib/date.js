import Vue from 'vue';

export function parseDate(date) {
    if (typeof date === 'string' && date.length !== 24) {
        return date;
    }

    const dateJs = new Date(date);

    if (Number.isNaN(dateJs.getDate())) {
        return date;
    }

    const day = `0${dateJs.getDate()}`.slice(-2);
    const month = `0${dateJs.getMonth() + 1}`.slice(-2);
    const year = dateJs.getFullYear();

    const hour = `0${dateJs.getHours()}`.slice(-2);
    const minutes = `0${dateJs.getMinutes()}`.slice(-2);

    return `${day}/${month}/${year} ${hour}:${minutes}`;
}

const dateRegexp = /([0-9]{2})\/([0-9]{2})\/([0-9]{4}) ([0-9]{2}):([0-9]{2})/;

export function convertDate(dateString) {
    const result = dateString.match(dateRegexp);

    if (!result) {
        return dateString;
    }

    return new Date(result[3], result[2] - 1, result[1], result[4], result[5]);
}

Vue.filter('date', date => parseDate(date));
