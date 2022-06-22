export default {
  // General
  cancel: 'Annuler',
  confirm: 'Confirmer',
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
    buy: 'Acheter',
    sell: 'Vendre',
    error: 'Nombre positif requis',

    // Confirm dialog
    confirm: {
      header: 'Commander un Devis',
      refresh: {
        message:
          'Les taux du marché seront automatiquement actualisés tous les',
        unit: 'seconds'
      },
      purchase: 'Acheter',
      transaction: 'Frais de transaction',
      error: {
        quote: 'Erreur lors de la récupération du devis',
        trade: 'Erreur lors de la confirmation de léchange'
      }
    }
  }
};
