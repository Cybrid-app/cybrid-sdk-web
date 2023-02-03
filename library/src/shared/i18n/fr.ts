export default {
  // General
  cancel: 'ANNULER',
  confirm: 'CONFIRMER',
  done: 'FAIT',
  begin: 'COMMENCER',
  resume: 'RECOMMENCER',
  disconnect: 'DÉCONNECTER',
  reconnect: 'RECONNECTER',
  back: 'Retourner',
  date: 'Date',
  to: 'À',
  from: 'De',
  fatal: "Une erreur irrécupérable s'est produite",
  unexpectedError: 'Erreur inattendue.',

  // Price list component
  priceList: {
    title: 'Liste de prix',
    table: {
      symbol: 'Symbole',
      price: 'Prix',
      filter: 'Rechercher une crypto-monnaie'
    },
    error: 'Erreur lors de la récupération des pièces',
    empty: 'Aucune pièce trouvée',
    refreshButton: 'Rafraîchir'
  },

  // Trade component
  trade: {
    amount: 'montant',
    quantity: 'quantité',
    currency: 'Devise',
    buy: 'ACHETER',
    sell: 'VENDRE ',
    error: 'Nombre positif requis',
    transaction: 'Frais de transaction',

    // Confirm dialog
    confirm: {
      header: 'Commander un Devis',
      refresh: {
        message:
          'Les taux du marché seront automatiquement actualisés tous les',
        unit: 'seconds'
      },
      purchase: 'Acheter',
      sell: 'Vendre',
      loading: 'Devis en attente',
      error: {
        quote: 'Erreur lors de la récupération du devis',
        trade: 'Erreur lors de la confirmation de léchange'
      }
    },

    // Summary dialog
    summary: {
      submission: 'Commande Soumise',
      details: 'en',
      message: 'Votre commande a été passée, merci.',
      status: 'Statut',
      purchased: 'Acheté',
      buy: 'Acheter',
      id: 'Transaction ID:',
      sell: 'Vendre',
      sold: 'Vendu',
      submitting: 'Soumettre une commande de crypto',
      loading: 'Chargement de la commande crypto',
      error: 'Erreur lors de la récupération de léchange'
    }
  },

  // Account list component
  accountList: {
    total: 'Valeur du Compte',
    available: 'Disponible pour le Commerce',
    account: {
      header: 'Actif',
      subheader: 'Prix du Marché'
    },
    balance: 'Solde',
    error: {
      account: 'Erreur lors de la récupération des comptes',
      noData: 'Aucun compte trouvé'
    }
  },

  // Account details component
  accountDetails: {
    holdings: 'Avoirs',
    trade: 'Échanger',
    transactions: 'Transactions Récentes',
    balance: 'Solde',
    error: {
      account: 'Erreur lors de la récupération des transactions',
      noData: 'Aucun commerce trouvé'
    }
  },

  // Account balance component
  accountBalance: {
    pending: 'En attente',
    settled: 'Aucune transaction en attente'
  },

  // Account trade component
  accountTrade: {
    side: {
      buy: 'Acheté',
      sell: 'Vendu'
    },
    subheader: 'en',
    status: 'Statut',
    placed: 'Mis',
    finalized: 'Finalisé',
    date: 'Date',
    fee: 'Frais',
    order: 'Identifiant commercial',

    message: 'Your order has been placed, thank you.',
    purchased: 'Purchased',
    sold: 'Sold',
    loading: 'Submitting Crypto Order',
    error: 'Error fetching trade'
  },

  // Paginator
  paginator: {
    firstPageLabel: 'Première page',
    itemsPerPageLabel: 'Objets par page',
    lastPageLabel: 'Dernière page',
    nextPageLabel: 'Page suivante',
    previousPageLabel: 'Page précédente',
    page: 'Page',
    of: 'de'
  },

  // Identity verification component
  identityVerification: {
    checkStatus: "Vérification de l'état...",
    verifying: 'Vérification...',
    verified: 'Vous avez été vérifié.',
    rejected: "Impossible de vérifier l'identité.",
    support: 'Veuillez contacter le service client.',
    reviewing: 'Identité en cours de révision.',
    processing: "Traitement de la vérification d'identité, revenez plus tard",
    resume: "Reprendre la vérification d'identité."
  },

  // Bank account connect component
  bankAccountConnect: {
    addAccount: 'Ajout de compte...',
    reconnectAccount: 'Reconnexion du compte...',
    successAdded: 'Compte ajouté avec succès.',
    successReconnect: 'Compte reconnecté avec succès.',
    resumeAdding: "Reprendre l'ajout du compte.",
    resumeConnect: 'Reprendre la reconnexion du compte',
    mobile: {
      warning: 'Temporairement indisponible sur mobile.',
      explanation:
        "Veuillez connecter votre compte bancaire à l'aide d'un navigateur de bureau."
    },

    // Confirm dialog
    confirm: {
      title: 'Sélectionnez la devise',
      subtitle:
        'Nous ne sommes pas en mesure de déterminer la devise de votre compte. Veuillez sélectionner la bonne devise parmi les options ci-dessous.',
      label: 'Devise'
    }
  },

  // Bank account list component
  bankAccountList: {
    account: 'Compte',
    status: 'Statut',
    addAccount: 'AJOUTER UN COMPTE',
    empty: 'Aucun compte bancaire connecté.',
    error: 'Erreur lors de la récupération des comptes bancaires.',
    state: {
      storing: 'En attente',
      completed: 'Connecté',
      failed: 'Échoué',
      refresh_required: 'Actualisation requise',
      deleting: 'Déconnexion...',
      deleted: 'Déconnecté'
    },

    // Details dialog
    details: {
      title: 'Détails du compte',
      name: 'Nom',
      asset: 'Actif',
      number: 'Numéro',
      status: 'Statut'
    }
  },

  // Transfer component
  transfer: {
    transfer: 'Transférer',
    amount: 'Quantité',
    bankAccount: 'Compte Bancaire',
    deposit: 'Verser',
    withdraw: 'Se désister',
    withdrawal: 'Retrait',
    processing: 'Traitement',
    noAccount: 'Aucun compte bancaire connecté.',
    addAccount: 'Ajouter un compte',
    nonSufficientFunds: 'Fonds non suffisants',
    error: 'Erreur lors de la création du transfert',

    // Confirm dialog
    confirm: {
      confirm: 'Confirmer',
      depositDate: 'Date de dépôt'
    },

    // Details dialog
    details: {
      details: 'Détails',
      state: 'État'
    }
  }
};
