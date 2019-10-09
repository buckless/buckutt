export default {
    icon: 'account_balance_wallet',
    model: 'wallets',
    title: 'Porte-monnaie',
    list: [
        {
            icon: 'account_balance_wallet',
            field: 'physical_id',
            label: 'Identifiant',
            type: 'text',
            lockEdition: true
        },
        {
            icon: 'account_balance_wallet',
            field: 'logical_id',
            label: 'Identifiant logique',
            type: 'text',
            lockEdition: true
        },
        {
            icon: 'attach_money',
            field: 'credit',
            label: 'Solde',
            type: 'price',
            lockEdition: true
        }
    ],
    protip: {
        text:
            'Vous pouvez ici gérer le contenu lié aux porte-monnaie actifs de votre espace cashless',
        subtitle:
            'Vous pouvez accéder aux porte-monnaie non liés à un support depuis le menu Utilisateurs'
    },
    itemList: {
        field: 'physical_id'
    },
    extraTabs: [
        {
            title: 'Historique',
            route: 'history'
        },
        {
            title: 'Transactions bancaires',
            route: 'transactions'
        },
        {
            title: 'Groupes',
            route: 'groups',
            deactivation: object => object.user_id
        },
        {
            title: 'Utilisateur',
            route: 'user',
            deactivation: object => !object.user_id
        }
    ],
    removable: false,
    debounce: 'searchWallets'
};
