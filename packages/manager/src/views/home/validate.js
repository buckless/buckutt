export const validateCustomAmountForm = ({ customAmount }) => {
    const errors = { customAmount: false };

    const value = parseInt(customAmount, 10);

    if (
        !Number.isInteger(value) ||
        !Number.isSafeInteger(value) ||
        value.toString() !== customAmount ||
        value <= 0
    ) {
        errors.customAmount = 'invalidCustomAmount';
    }

    return errors;
};
