import { history } from 'config/manager';
import Vue from 'vue';

const showYears = history.showYears;

export const formatDate = date => {
    const dateJs = new Date(date);

    const day = `0${dateJs.getDate()}`.slice(-2);
    const month = `0${dateJs.getMonth() + 1}`.slice(-2);
    const year = dateJs
        .getFullYear()
        .toString()
        .slice(-2);

    const hour = `0${dateJs.getHours()}`.slice(-2);
    const minutes = `0${dateJs.getMinutes()}`.slice(-2);

    let dateDate = [day, month];

    if (showYears) {
        dateDate.push(year);
    }

    return `${dateDate.join('/')} ${hour}:${minutes}`;
};

Vue.filter('date', date => formatDate(date));
