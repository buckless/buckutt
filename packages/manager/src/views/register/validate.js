import isEmail from 'validator/lib/isEmail';

export const isPasswordSecure = password => password.length >= 6;

export const validateRegisterForm = ({ mail, firstName, lastName, password }) => {
    const errors = {};

    if (typeof mail !== 'string' || mail.length === 0) {
        errors.mail = 'missingMail';
    }

    if (typeof password !== 'string' || password.length === 0) {
        errors.password = 'missingPassword';
    }

    if (typeof firstName !== 'string' || firstName.length === 0) {
        errors.firstName = 'missingFirstName';
    }

    if (typeof lastName !== 'string' || lastName.length === 0) {
        errors.lastName = 'missingLastName';
    }

    if (!isPasswordSecure(password)) {
        errors.password = 'passwordInsecure';
    }

    if (!isEmail(mail)) {
        errors.mail = 'invalidMail';
    }

    return errors;
};
