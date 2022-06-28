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
      loading: 'Devis en attente',
      error: {
        quote: 'Erreur lors de la récupération du devis'
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
  }
};
