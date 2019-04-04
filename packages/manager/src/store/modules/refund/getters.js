import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/currency';

export const refund = state => ({
    allowed: state.allowed,
    alreadyAsked: state.alreadyAsked,
    minimum: state.minimum,
    refundable: state.refundable,
    start: state.start,
    end: state.end,
    cardRegistered: state.cardRegistered
});

export const whyCant = state => {
    const errors = [];
    const now = new Date();

    if (state.alreadyAsked) {
        return [
            `Vous avez déjà fait votre demande de remboursement au ${formatDate(
                state.alreadyAsked.created_at
            )}`
        ];
    }

    if (state.minimum <= 0 || !state.start) {
        return ["Le remboursement n'a pas été activé par l'organisateur"];
    }

    if (state.refundable < state.minimum) {
        errors.push(`Le remboursement minimum est de : ${formatCurrency(state.minimum / 100)}`);
    }

    if (now <= new Date(state.start)) {
        errors.push(
            `Les remboursements ne sont pas encore ouverts avant le ${formatDate(state.start)}`
        );
    }

    if (now >= new Date(state.end)) {
        errors.push(`Les remboursements sont fermés depuis le ${formatDate(state.end)}`);
    }

    return errors;
};
