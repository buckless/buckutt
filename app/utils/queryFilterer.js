const opToSql = {
    gt: '>',
    lt: '<',
    ge: '>=',
    le: '<=',
    eq: '=',
    ne: '<>',
    in: 'in'
};

module.exports = (query, filters) => {
    let filteredQuery = query;
    const filtersToLoop = Array.isArray(filters) ? filters : [filters];

    filtersToLoop.forEach(filter => {
        const f = filter;

        for (const op of ['gt', 'ne', 'lt', 'ge', 'le', 'eq', 'in']) {
            if (f.hasOwnProperty(op)) {
                if (f.date) {
                    f[op] = new Date(f[op]);
                }

                filteredQuery = filteredQuery.where(f.field, opToSql[op], f[op]);
            }
        }
    });

    return filteredQuery;
};
