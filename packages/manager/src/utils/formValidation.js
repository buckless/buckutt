export const areErrorsOnlyFalse = errors =>
    Boolean(Object.values(errors).reduce((acc, error) => acc && !error, true));

export const hasError = errors => {
    if (!errors || typeof errors !== 'object') {
        return false;
    }

    return Object.keys(errors).length > 0 && !areErrorsOnlyFalse(errors);
};

export const buildValidation = (fields, validateFunction) => {
    return function(e) {
        let vm = this;

        const values = fields.reduce(
            (acc, field) => ({
                ...acc,
                [field]: vm[field]
            }),
            {}
        );

        const errors = validateFunction(values);

        if (e && e.target && e.target.name) {
            vm.$set(vm.errors, e.target.name, errors[e.target.name]);
            return;
        }

        if (hasError(errors)) {
            vm.errors = errors;
            return false;
        }

        return true;
    };
};
