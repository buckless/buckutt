import sortOrder from '@/lib/sortOrder';

export default {
    icon: 'devices',
    model: 'devices',
    title: 'Équipements',
    list: [
        {
            icon: 'tablet',
            field: 'name',
            label: "Nom de l'équipement",
            type: 'text'
        },
        {
            icon: 'security',
            field: 'fingerprint',
            label: 'Clé unique',
            type: 'text'
        },
        {
            icon: 'cast',
            field: 'authorized',
            label: 'Équipement associé',
            type: 'boolean',
            lockEdition: true
        },
        {
            icon: 'done_all',
            field: 'doubleValidation',
            label: 'Badgeage avant achat',
            type: 'boolean',
            lockEdition: true
        },
        {
            icon: 'local_drink',
            field: 'alcohol',
            label: 'Avertissement alcool',
            type: 'boolean',
            lockEdition: true
        }
    ],
    protip: {
        text: 'Vous pouvez ici associer, supprimer et choisir les options de vos équipements',
        subtitle:
            'Connectez un équipement pour la première fois à votre espace cashless pour le voir apparaître ici'
    },
    itemList: {
        field: 'name',
        subtitle: item => (!item.authorized ? 'Équipement non associé' : undefined),
        sort: (a, b) => sortOrder(a.authorized, b.authorized) || sortOrder(a.name, b.name),
        hide: ['web']
    },
    extraTabs: [
        {
            title: 'Options',
            route: 'options'
        },
        {
            title: 'Guichets',
            route: 'assign'
        }
    ],
    notifications: {
        edit: "L'équipement a bien été modifié",
        delete: "L'équipement a bien été supprimé",
        error: 'Il y a eu une erreur pour cet équipement'
    }
};
