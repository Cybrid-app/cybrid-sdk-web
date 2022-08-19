export default {
  // General
  cancel: 'ANNULER',
  confirm: 'CONFIRMER',
  done: 'FAIT',
  back: 'Retourner',
  date: 'Date',
  fatal: "Une erreur irrécupérable s'est produite",

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
    total: 'VALEUR TOTALE',
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
  }
};
