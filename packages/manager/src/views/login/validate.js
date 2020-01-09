import isEmail from 'validator/lib/isEmail';

export const validateLoginForm = ({ mail, password }) => {
    const errors = {};

    if (typeof mail !== 'string' || mail.length === 0) {
        errors.mail = 'missingMail';
    }

    if (typeof password !== 'string' || password.length === 0) {
        errors.password = 'missingPassword';
    }

    if (!isEmail(mail)) {
        errors.mail = 'invalidMail';
    }

    return errors;
};
