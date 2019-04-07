import {
    addDays,
    getDay,
    setDate,
    getDaysInMonth,
    getDate,
    eachDayOfInterval,
    isSameDay,
    isAfter,
    isBefore
} from 'date-fns';

import rotate from './rotate';

export const getWeek = lng => rotate([0, 1, 2, 3, 4, 5, 6], lng.options.weekStartsOn);

export const getWeekDays = lng => getWeek(lng).map(n => lng.localize.day(n).slice(0, 3));

export const onlyDate = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const getDays = (lng, viewDate, min, max) => {
    viewDate = onlyDate(viewDate);
    min = min && onlyDate(min);
    max = max && onlyDate(max);

    const week = getWeek(lng);
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDayOfMonth = setDate(viewDate, 1);
    const lastDayOfMonth = setDate(viewDate, daysInMonth);

    // take first weekday before firstDayOfMonth
    const start =
        getDay(firstDayOfMonth) === lng.options.weekStartsOn
            ? firstDayOfMonth
            : // remove days until it is first weekday before firstDayOfMonth
              addDays(firstDayOfMonth, -1 * (getDay(firstDayOfMonth) - lng.options.weekStartsOn));

    // take last weekday after lastDayOfMonth
    const end =
        getDay(lastDayOfMonth) === week[week.length - 1]
            ? lastDayOfMonth
            : // add days until it is last weekday after lastDayOfMonth
              addDays(lastDayOfMonth, 6 - week.indexOf(getDay(lastDayOfMonth)));

    return eachDayOfInterval({ start, end }).map(day => ({
        date: getDate(day),
        fullDate: day,
        isToday: isSameDay(day, new Date()),
        isInRange:
            (min ? isAfter(day, addDays(min, -1)) : true) &&
            (max ? isBefore(day, addDays(max, 1)) : true),
        inMonth:
            isAfter(day, addDays(firstDayOfMonth, -1)) && isBefore(day, addDays(lastDayOfMonth, 1))
    }));
};
