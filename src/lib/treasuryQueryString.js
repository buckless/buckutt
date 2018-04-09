export default filters =>
    Object.keys(filters)
        .filter(key => filters[key])
        .map(key => (filters[key].id ? `${key}=${filters[key].id}` : `${key}=${filters[key]}`))
        .join('&');
