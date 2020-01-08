export default {
    model: 'alerts',
    createTitle: 'Créer une nouvelle alerte',
    list: [
        {
            field: 'content',
            label: "Contenu de l'alerte",
            type: 'text'
        },
        {
            field: 'minimumViewTime',
            label: "Durée d'affichage minimale",
            type: 'text',
            default: '5'
        }
    ],
    notifications: {
        create: "L'alerte a bien été envoyée",
        error: 'Il y a eu une erreur pour cette alerte'
    }
};
