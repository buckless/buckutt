const addCreate = (Create, entries) => {
    const final = [];

    entries.forEach(entry => {
        final.push(entry);
        final.push({
            path: entry.path ? `${entry.path}/create` : 'create',
            props: {
                default: entry.props,
                create: entry.props
            },
            components: {
                default: entry.component,
                create: Create
            }
        });
    });

    return final;
};

export default addCreate;
