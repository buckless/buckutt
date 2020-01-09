import isEmail from 'validator/lib/isEmail';

export const isPasswordSecure = password => password.length >= 6;

export const validateForgotForm = ({ mail }) => {
    const errors = {};

    if (typeof mail !== 'string' || mail.length === 0) {
        errors.mail = 'missingMail';
    }
    if (!isEmail(mail)) {
        errors.mail = 'invalidMail';
    }

    return errors;
};

export const validateResetForm = ({ password, confirmation }) => {
    const errors = {};

    if (typeof password !== 'string' || password.length === 0) {
        errors.password = 'missingPassword';
    }

    if (typeof confirmation !== 'string' || confirmation.length === 0) {
        errors.confirmation = 'missingConfirmation';
    }

    if (!isPasswordSecure(password)) {
        errors.password = 'passwordInsecure';
    }

    if (password !== confirmation) {
        errors.confirmation = 'passwordDontMatch';
    }

    return errors;
};
