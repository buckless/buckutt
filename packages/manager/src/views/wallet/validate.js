import { isValid } from '../../utils/money';

export const validateTransferForm = ({ receiver, amount }) => {
    const errors = {};

    if (typeof receiver !== 'string' || receiver.length === 0) {
        errors.receiver = 'missingReceiver';
    }

    if (typeof amount !== 'string' || amount.length === 0) {
        errors.amount = 'missingAmount';
    }

    if (!isValid(amount)) {
        errors.amount = 'invalidAmount';
    }

    return errors;
};
