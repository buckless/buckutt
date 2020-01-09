export const isPasswordSecure = password => password.length >= 6;
export const isPinRightLength = pin => pin.length === 4 && !isNaN(pin);

export const validateUserForm = ({
    currentPassword,
    password,
    confirmation,
    currentPin,
    pin,
    confirmationPin
}) => {
    const errors = {};

    if (typeof currentPassword === 'string' && currentPassword.length > 0) {
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
    }

    if (typeof currentPin === 'string' && currentPin.length > 0) {
        if (typeof pin !== 'string' || pin.length === 0) {
            errors.pin = 'missingPin';
        }

        if (typeof confirmationPin !== 'string' || confirmationPin.length === 0) {
            errors.confirmationPin = 'missingConfirmation';
        }

        if (!isPinRightLength(pin)) {
            errors.pin = 'pinWrongFormat';
        }

        if (pin !== confirmationPin) {
            errors.confirmationPin = 'pinDontMatch';
        }
    }

    if (
        (typeof currentPassword !== 'string' || currentPassword.length === 0) &&
        (typeof currentPin !== 'string' || currentPin.length === 0)
    ) {
        errors.currentPassword = 'missingPassword';
        errors.currentPin = 'missingPin';
    }

    return errors;
};
