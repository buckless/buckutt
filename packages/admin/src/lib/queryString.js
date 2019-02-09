export default filters => {
    const q = filters.map(filter => encodeURIComponent(JSON.stringify(filter)));

    return q.join('&q[]=');
};
