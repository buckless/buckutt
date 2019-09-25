export default {
    icon: 'location_on',
    model: 'points',
    title: 'Guichets',
    createTitle: 'Créer un nouveau guichet',
    list: [
        {
            icon: 'location_on',
            field: 'name',
            label: 'Nom du guichet',
            type: 'text'
        }
    ],
    protip: {
        text: 'Vous pouvez ici créer, renommer, supprimer et paramétrer vos guichets',
        subtitle: 'Vous pouvez afficher le même guichet sur plusieurs équipements différents'
    },
    itemList: {
        field: 'name',
        hide: ['Internet']
    },
    extraTabs: [
        {
            title: "Historique d'accès",
            route: 'accesses'
        },
        {
            title: 'Articles',
            route: 'categories'
        },
        {
            title: 'Formules',
            route: 'promotions'
        }
    ],
    notifications: {
        create: 'Le guichet a bien été créé',
        edit: 'Le guichet a bien été modifié',
        delete: 'Le guichet a bien été supprimé',
        error: 'Il y a eu une erreur pour ce guichet'
    }
};
