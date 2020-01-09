import { i18n } from '../../locales';
import { format } from '../../utils/money';
import { isMobile } from '../../utils/isMobile';

const translateTable = type => i18n.t(`views.home.history.${type}`);

const icons = {
    transfer: 'transform',
    reload: 'attach_money',
    'reload-cancellation': 'money_off',
    refund: 'money_off',
    'refund-cancellation': 'attach_money',
    purchase: 'shopping_cart',
    'purchase-cancellation': 'remove_shopping_cart',
    promotion: 'shopping_cart',
    'promotion-cancellation': 'remove_shopping_cart',
    withdrawal: 'shopping_cart',
    'withdrawal-cancellation': 'remove_shopping_cart'
};

export const getIcon = ({ type }) => icons[type];

export const getTitle = ({ type, meanOfPayment, articles, promotion }, meansOfPayment) => {
    const splittedType = type.split('-');
    const rawType = splittedType[0];

    const prefix =
        splittedType[1] === 'cancellation' ? i18n.t('views.home.history.cancellation') : '';

    const title = `${prefix} ${translateTable(rawType)}`;

    switch (rawType) {
        case 'reload':
            return `${title} ${meansOfPayment[meanOfPayment] ||
                i18n.t('views.home.history.other')}`;
        case 'refund':
            return `${title} ${meansOfPayment[meanOfPayment] ||
                i18n.t('views.home.history.other')}`;
        case 'purchase':
            return `${title} ${articles[0]}`;
        case 'promotion':
            return `${title} ${promotion}`;
        default:
            return title;
    }
};

export const getSubtitle = ({ type, point, articles, date }) => {
    const rawType = type.replace('-cancellation', '');

    if (isMobile()) {
        return `${i18n.d(date, 'short')} • ${point}`;
    }

    if (rawType === 'promotion') {
        return `${i18n.t('views.home.history.date')}: ${i18n.d(date, 'short')} • ${i18n.t(
            'views.home.history.wiket'
        )}: ${point} • ${i18n.t('views.home.history.content')}: ${articles.join(', ')}`;
    }

    return `${i18n.t('views.home.history.date')}: ${i18n.d(date, 'short')} • ${i18n.t(
        'views.home.history.wiket'
    )}: ${point}`;
};

export const historyEntryToTableRow = (historyEntry, meansOfPayment) => ({
    id: historyEntry.id,
    icon: getIcon(historyEntry),
    title: getTitle(historyEntry, meansOfPayment),
    subtitle: getSubtitle(historyEntry),
    right: format({ amount: historyEntry.amount, showPlus: true })
});
