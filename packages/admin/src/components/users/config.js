export default {
    icon: 'person',
    model: 'users',
    title: 'Utilisateurs',
    createTitle: 'Créer un nouvel utilisateur',
    list: [
        {
            icon: 'person',
            field: 'lastname',
            label: 'Nom',
            type: 'text'
        },
        {
            icon: 'person',
            field: 'firstname',
            label: 'Prénom',
            type: 'text'
        },
        {
            icon: 'person',
            field: 'nickname',
            label: 'Surnom',
            type: 'text'
        },
        {
            icon: 'security',
            field: 'pin',
            label: 'Code PIN',
            type: 'password'
        },
        {
            icon: 'security',
            field: 'password',
            label: 'Mot de passe',
            type: 'password'
        },
        {
            icon: 'email',
            field: 'mail',
            label: 'Adresse email',
            type: 'text'
        }
    ],
    protip: {
        text: 'Vous pouvez ici gérer les accès et droits de vos utilisateurs',
        subtitle:
            "Les groupes et les droits d'un utilisateur sont automatiquement appliqués à tous les supports lui étant liés"
    },
    itemList: {
        field: 'fullname'
    },
    extraTabs: [
        {
            title: 'Groupes',
            route: 'groups'
        },
        {
            title: 'Droits',
            route: 'rights'
        },
        {
            title: 'Transactions bancaires',
            route: 'transactions'
        }
    ],
    debounce: 'searchUsers',
    notifications: {
        create: "L'utilisateur a bien été créé",
        edit: "L'utilisateur a bien été modifié",
        delete: "L'utilisation a bien été supprimé",
        error: 'Il y a eu une erreur pour cet utilisateur'
    }
};
