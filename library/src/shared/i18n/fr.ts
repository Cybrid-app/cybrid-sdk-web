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
      header: 'Commande Soumise',
      message: 'Votre commande a été passée, merci.',
      purchased: 'Acheté',
      sold: 'Vendu',
      id: 'Transaction ID:',
      loading: 'Soumettre une commande de crypto',
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

  // Account detail component
  accountDetail: {
    holdings: 'Avoirs',
    buy: 'Acheter',
    sell: 'Vendre',
    transactions: 'Transactions Récentes',
    balance: 'Solde',
    error: {
      account: 'Erreur lors de la récupération des transactions',
      noData: 'Aucun commerce trouvé'
    }
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
