export default {
    icon: 'stars',
    model: 'promotions',
    title: 'Formules',
    createTitle: 'Créer une nouvelle formule',
    list: [
        {
            icon: 'stars',
            field: 'name',
            label: 'Nom de la formule',
            type: 'text'
        }
    ],
    protip: {
        text: 'Vous pouvez ici créer, renommer, supprimer et définir le contenu de vos formules',
        subtitle:
            'Pour former une formule, un panier doit contenir un article de chaque ensemble la composant'
    },
    itemList: {
        field: 'name',
        hide: []
    },
    extraTabs: [
        {
            title: 'Contenu',
            route: 'content'
        }
    ],
    notifications: {
        create: 'La formule a bien été créée',
        edit: 'La formule a bien été modifiée',
        delete: 'La formule a bien été supprimée',
        error: 'Il y a eu une erreur pour cette formule'
    }
};
