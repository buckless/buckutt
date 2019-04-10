import { formatDate } from '@/lib/date';
import { formatCurrency } from '@/lib/currency';
import i18n from '@/i18n';

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
            i18n.t('dashboard.refund.errors.already', {
                value: formatDate(state.alreadyAsked.created_at)
            })
        ];
    }

    if (state.minimum <= 0 || !state.start) {
        return [i18n.t('dashboard.refund.errors.deactivated')];
    }

    if (state.refundable < state.minimum) {
        errors.push(
            i18n.t('dashboard.refund.errors.minimum', {
                value: formatCurrency(state.minimum / 100)
            })
        );
    }

    if (now <= new Date(state.start)) {
        errors.push(i18n.t('dashboard.refund.errors.start', { value: formatDate(state.start), value2: formatDate(state.end) }));
    }

    if (now >= new Date(state.end)) {
        errors.push(i18n.t('dashboard.refund.errors.end', { value: formatDate(state.end) }));
    }

    return errors;
};
