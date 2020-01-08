export default {
    icon: 'free_breakfast',
    model: 'articles',
    title: 'Articles',
    createTitle: 'Créer un nouvel article',
    hasImage: true,
    list: [
        {
            icon: 'free_breakfast',
            field: 'name',
            label: "Nom de l'article",
            type: 'text'
        },
        {
            icon: 'local_drink',
            field: 'alcohol',
            label: 'Unités alcool',
            type: 'text',
            default: '0'
        }
    ],
    protip: {
        text: 'Vous pouvez ici créer, renommer, supprimer et changer la miniature de vos articles',
        subtitle:
            "Les articles sont ré-utilisables dans plusieurs guichets. Ne créez qu'une occurence de chaque et réutilisez-la"
    },
    itemList: {
        field: 'name',
        hide: ['Défaut']
    },
    notifications: {
        create: "L'article a bien été créé",
        edit: "L'article a bien été modifié",
        delete: "L'article a bien été supprimé",
        error: 'Il y a eu une erreur pour cet article'
    }
};
