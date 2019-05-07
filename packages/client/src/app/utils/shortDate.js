export default date => {
    const baseDate = new Date(date);
    const p = n => (n < 10 ? `0${n}` : n.toString());

    let shortDate = `${p(baseDate.getDate())}/${p(baseDate.getMonth() + 1)}`;
    shortDate += '-';
    shortDate += `${p(baseDate.getHours())}:${p(baseDate.getMinutes())}`;

    return shortDate;
};
