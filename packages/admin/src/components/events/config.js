import slugify from 'slugify';
import sortOrder from '@/lib/sortOrder';
import { parseDate } from '@/lib/date';
import { parsePrice } from '@/lib/price';

// Event basis
export const event = {
    route: 'event',
    title: 'Événement',
    icon: 'event',
    tabs: [
        { title: 'Configuration', route: '' },
        { title: 'Dates', route: 'dates' },
        { title: 'Périodes', route: 'periods' },
        { title: 'Fondations', route: 'fundations' },
        { title: 'Groupes', route: 'groups' },
        { title: 'Supports NFC', route: 'nfc' }
    ]
};

export const events = {
    model: 'events',
    list: [
        {
            icon: 'event',
            field: 'name',
            label: "Nom de l'événement",
            type: 'text'
        },
        {
            icon: 'mail',
            field: 'contactMail',
            label: "Adresse mail de contact",
            type: 'text'
        },
        {
            icon: 'local_drink',
            field: 'maxAlcohol',
            label: "Quantité d'alcool maximale",
            type: 'text'
        },
        {
            icon: 'markunread_mailbox',
            field: 'companyName',
            label: 'Nom de la structure',
            type: 'text'
        },
        {
            icon: 'markunread_mailbox',
            field: 'companyAddress',
            label: 'Adresse postale',
            type: 'text'
        },
        {
            icon: 'markunread_mailbox',
            field: 'companyPostal',
            label: 'Code postal',
            type: 'text'
        },
        {
            icon: 'markunread_mailbox',
            field: 'companyCity',
            label: 'Ville',
            type: 'text'
        },
        {
            icon: 'markunread_mailbox',
            field: 'companyCountry',
            label: 'Pays',
            type: 'text'
        },
        {
            icon: 'phone',
            field: 'companyPhone',
            label: 'Numéro de téléphone',
            type: 'text'
        }
    ],
    removable: false,
    notifications: {
        edit: 'Les paramètres ont bien été modifiés',
        error: 'Il y a eu une erreur lors de la modification des paramètres'
    }
};

export const dates = {
    model: 'periods',
    list: [
        {
            icon: 'local_drink',
            field: 'start',
            label: 'Début',
            type: 'date'
        },
        {
            icon: 'local_drink',
            field: 'end',
            label: 'Fin',
            type: 'date'
        }
    ],
    removable: false
};

export const periods = {
    category: 'event',
    model: 'periods',
    createTitle: 'Créer une nouvelle période',
    editTitle: 'Modifier une période',
    createButton: 'Nouvelle période',
    eventField: 'usePeriods',
    dswitch: {
        icon: 'alarm',
        title: 'Activer les périodes',
        subtitle:
            "Les périodes permettent d'établir des droits, ou des prix sur des laps de temps donnés."
    },
    list: [
        {
            field: 'name',
            label: 'Nom de la période',
            type: 'text'
        },
        {
            field: 'start',
            label: 'Début',
            type: 'date'
        },
        {
            field: 'end',
            label: 'Fin',
            type: 'date'
        }
    ],
    display: rows =>
        rows
            .filter(period => period.name !== 'Défaut')
            .sort((a, b) => sortOrder(a.end, b.end, 'DESC') || sortOrder(a.start, b.start, 'DESC'))
            .map(period => ({
                id: period.id,
                icon: new Date(period.end) >= new Date() ? 'alarm' : 'alarm_off',
                title: period.name,
                subtitle: `Début: ${parseDate(period.start)} • Fin: ${parseDate(period.end)}`
            })),
    notifications: {
        create: "La période a bien été créée",
        edit: "La période a bien été modifiée",
        delete: "La période a bien été supprimée",
        error: "Il y a eu une erreur pour cette période"
    }
};

export const groups = {
    category: 'event',
    model: 'groups',
    createTitle: 'Créer un nouveau groupe',
    editTitle: 'Modifier un groupe',
    createButton: 'Nouveau groupe',
    eventField: 'useGroups',
    dswitch: {
        icon: 'group',
        title: "Activer les groupes d'utilisateurs",
        subtitle:
            "Les groupes d'utilisateurs permettent d'associer des tarifs différents selon l'appartenance d'un client à un groupe."
    },
    list: [
        {
            field: 'name',
            label: 'Nom du groupe',
            type: 'text'
        }
    ],
    display: rows =>
        rows
            .filter(group => group.name !== 'Défaut')
            .sort((a, b) => sortOrder(a.name, b.name))
            .map(group => ({
                id: group.id,
                icon: 'group',
                title: group.name
            })),
    notifications: {
        create: "Le groupe a bien été créé",
        edit: "Le groupe a bien été modifié",
        delete: "Le groupe a bien été supprimé",
        error: "Il y a eu une erreur pour ce groupe"
    }
};

export const fundations = {
    category: 'event',
    model: 'fundations',
    createTitle: 'Créer une nouvelle fondation',
    editTitle: 'Modifier une fondation',
    createButton: 'Nouvelle fondation',
    eventField: 'useFundations',
    dswitch: {
        icon: 'local_atm',
        title: 'Activer les fondations',
        subtitle:
            "Les fondations permettent de répartir l'argent des ventes via le système entre plusieurs comptes virtuels."
    },
    list: [
        {
            field: 'name',
            label: 'Nom de la fondation',
            type: 'text'
        }
    ],
    display: rows =>
        rows
            .filter(fundation => fundation.name !== 'Défaut')
            .sort((a, b) => sortOrder(a.name, b.name))
            .map(fundation => ({
                id: fundation.id,
                icon: 'local_atm',
                title: fundation.name
            })),
    notifications: {
        create: "La fondation a bien été créée",
        edit: "La fondation a bien été modifiée",
        delete: "La fondation a bien été supprimée",
        error: "Il y a eu une erreur pour cette fondation"
    }
};

// Payments basis
export const payments = {
    route: 'payments',
    title: 'Paiements',
    icon: 'attach_money',
    tabs: [
        { title: 'Configuration', route: '' },
        { title: 'Moyens de paiement', route: 'meansofpayment' },
        { title: 'Offres', route: 'giftreloads' }
    ]
};

export const limits = {
    model: 'events',
    list: [
        {
            icon: 'attach_money',
            field: 'minReload',
            label: 'Rechargement minimal',
            type: 'price'
        },
        {
            icon: 'attach_money',
            field: 'maxPerAccount',
            label: 'Solde maximal autorisé',
            type: 'price'
        }
    ],
    removable: false,
    notifications: {
        edit: 'Les paramètres ont bien été modifiés',
        error: 'Il y a eu une erreur lors de la modification des paramètres'
    }
};

export const meansOfPayment = {
    category: 'payments',
    model: 'meansofpayment',
    createTitle: 'Créer un nouveau moyen de paiement',
    editTitle: 'Modifier un moyen de paiement',
    createButton: 'Nouveau moyen de paiement',
    list: [
        {
            field: 'name',
            label: 'Nom',
            type: 'text'
        },
        {
            field: 'type',
            label: 'Consigne',
            type: 'boolean',
            compute: entry => (entry.type = entry.type ? 'unit' : 'numeric'),
            display: entry => entry.type === 'unit'
        },
        {
            field: 'step',
            label: "Valeur de l'unité de consigne",
            type: 'price',
            compute: entry => (entry.type === 'numeric' ? undefined : entry.step)
        },
        {
            field: 'slug',
            type: 'hidden',
            compute: entry => slugify(entry.name, { lower: true }),
            lockEdition: true
        }
    ],
    display: rows =>
        rows.map(meanofpayment => ({
            id: meanofpayment.id,
            icon: 'credit_card',
            title: meanofpayment.name,
            subtitle: `Type: ${
                meanofpayment.type === 'unit'
                    ? `Consigne (${parsePrice(meanofpayment.step, true)})`
                    : 'Numérique'
            }`
        })),
    notifications: {
        create: 'Le moyen de paiement a bien été ajouté',
        edit: 'Le moyen de paiement a bien été modifié',
        delete: 'Le moyen de paiement a bien été supprimé',
        error: 'Il y a eu une erreur pour ce moyen de paiement'
    }
};

export const giftReloads = {
    category: 'payments',
    model: 'giftreloads',
    createTitle: 'Créer une nouvelle offre',
    editTitle: 'Modifier une offre',
    createButton: 'Nouvelle offre',
    list: [
        {
            field: 'amount',
            label: 'Montant offert',
            type: 'price'
        },
        {
            field: 'everyAmount',
            label: "Tranche d'achat",
            type: 'price'
        },
        {
            field: 'minimalAmount',
            label: 'Montant minimal de validité',
            type: 'price'
        }
    ],
    display: rows =>
        rows.map(giftreload => ({
            id: giftreload.id,
            icon: 'attach_money',
            title: `${parsePrice(giftreload.amount, true)} offert tous les ${parsePrice(
                giftreload.everyAmount,
                true
            )} rechargés`,
            subtitle:
                giftreload.minimalAmount > 0
                    ? `À partir de ${parsePrice(giftreload.minimalAmount, true)} de rechargements`
                    : 'Pour chaque rechargement'
        })),
    notifications: {
        create: "L'offre a bien été ajoutée",
        edit: "L'offre a bien été modifiée",
        delete: "L'offre' a bien été supprimée",
        error: 'Il y a eu une erreur pour cette offre'
    }
};

// Manager
export const manager = {
    route: 'manager',
    title: 'Espace client',
    icon: 'public',
    tabs: [{ title: 'Configuration', route: '' }, { title: 'Rechargements', route: 'reloads' }, { title: 'Remboursements', route: 'refunds' }]
};

export const managerConfig = {
    model: 'events',
    list: [
        {
            icon: 'public',
            field: 'activateManager',
            label: "Activer l'espace client",
            type: 'boolean'
        },
        {
            icon: 'add_circle_outline',
            field: 'allowRegistration',
            label: "Activer les inscriptions",
            type: 'boolean'
        },
        {
            icon: 'nfc',
            field: 'allowCardLinking',
            label: "Activer l'association des supports",
            type: 'boolean'
        },
        {
            icon: 'theaters',
            field: 'allowTicketLinking',
            label: "Activer l'association des tickets",
            type: 'boolean'
        },
        {
            icon: 'reorder',
            field: 'showInvoice',
            label: "Activer la génération de factures",
            type: 'boolean'
        },
        {
            icon: 'pages',
            field: 'showQrCode',
            label: "Afficher le QR Code d'association",
            type: 'boolean'
        }
    ],
    removable: false,
    notifications: {
        edit: "Les paramètres ont bien été modifiés",
        error: "Il y a eu une erreur lors de la modification des paramètres"
    }
};

export const reloads = {
    model: 'events',
    list: [
        {
            icon: 'calendar_today',
            field: 'accountReloadStart',
            label: 'Ouverture',
            type: 'date'
        },
        {
            icon: 'calendar_today',
            field: 'accountReloadEnd',
            label: 'Fermeture',
            type: 'date'
        },
        {
            icon: 'add_box',
            field: 'fixedCostsReload',
            label: 'Supplément fixe facturé',
            type: 'price'
        },
        {
            icon: 'add_box',
            field: 'variableCostsReload',
            label: 'Supplément variable facturé',
            type: 'percent'
        }
    ],
    removable: false,
    notifications: {
        edit: "Les paramètres ont bien été modifiés",
        error: "Il y a eu une erreur lors de la modification des paramètres"
    }
};

export const refunds = {
    model: 'events',
    list: [
        {
            icon: 'attach_money',
            field: 'minimumAccountRefund',
            label: 'Montant minimal remboursable',
            type: 'price'
        },
        {
            icon: 'calendar_today',
            field: 'accountRefundStart',
            label: 'Ouverture',
            type: 'date'
        },
        {
            icon: 'calendar_today',
            field: 'accountRefundEnd',
            label: 'Fermeture',
            type: 'date'
        },
        {
            icon: 'add_box',
            field: 'fixedCostsRefund',
            label: 'Supplément fixe prélevé',
            type: 'price'
        },
        {
            icon: 'add_box',
            field: 'variableCostsRefund',
            label: 'Supplément variable prélevé',
            type: 'percent'
        }
    ],
    removable: false,
    notifications: {
        edit: "Les paramètres ont bien été modifiés",
        error: "Il y a eu une erreur lors de la modification des paramètres"
    }
};

// Advanced
export const advanced = {
    route: 'advanced',
    title: 'Paramètres avancés',
    icon: 'developer_board',
    tabs: [{ title: 'Coupons', route: 'coupons' }, { title: 'Webhooks', route: 'webservices' }]
};

export const hooks = {
    category: 'advanced',
    model: 'webservices',
    createTitle: 'Ajouter une adresse',
    editTitle: 'Modifier une adresse',
    createButton: 'Nouvelle adresse',
    list: [
        {
            field: 'url',
            label: 'Adresse',
            type: 'text'
        }
    ],
    display: rows =>
        rows.map(webservice => ({
            id: webservice.id,
            icon: 'call_made',
            title: webservice.url,
            rightIcon: 'delete'
        })),
    notifications: {
        create: "Le webhook a bien été créé",
        edit: "Le webhook a bien été modifié",
        delete: "Le webhook a bien été supprimé",
        error: "Il y a eu une erreur pour ce webhook"
    }
};

export const coupons = {
    category: 'advanced',
    model: 'coupons',
    createTitle: 'Créer un coupon',
    editTitle: 'Modifier un coupon',
    createButton: 'Créer un coupon',
    removable: false,
    right: {
        icon: 'list',
        action: 'redirect',
        link: 'articles'
    },
    list: [
        {
            field: 'name',
            label: 'Nom',
            type: 'text'
        },
        {
            field: 'maxNumber',
            label: 'Nombre maximal cumulable (non modifiable)',
            type: 'text',
            lockEdition: true
        },
        {
            field: 'start',
            label: 'Début de validité',
            type: 'date'
        },
        {
            field: 'end',
            label: 'Fin de validité',
            type: 'date'
        }
    ],
    display: rows =>
        rows.map(coupon => ({
            id: coupon.id,
            icon: 'money',
            title: `${coupon.name} (${coupon.maxNumber} coupon maximum par support)`,
            subtitle: `Utilisable du ${parseDate(coupon.start)} au ${parseDate(coupon.end)}`
        })),
    notifications: {
        create: "Le coupon a bien été créé",
        edit: "Le coupon a bien été modifié",
        error: "Il y a eu une erreur pour ce coupon"
    }
};

export default {
    icon: 'settings',
    title: 'Configuration',
    protip: {
        text: 'Vous pouvez ici configurer le comportement de Buckless au sein de votre événement',
        subtitle: 'La configuration est mise à jour toutes les 20 minutes sur vos terminaux'
    }
};
