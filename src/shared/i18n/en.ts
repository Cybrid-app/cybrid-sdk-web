export default {
  // General
  cancel: 'Cancel',
  confirm: 'Confirm',
  fatal: 'An unrecoverable error occurred',

  // Price list component
  priceList: {
    title: 'Price List',
    table: {
      symbol: 'Currency',
      price: 'Price',
      filter: 'Search for crypto currency'
    },
    error: 'Error fetching coins',
    empty: 'No coins found',
    refreshButton: 'Refresh'
  },

  // Trade component
  trade: {
    amount: 'amount',
    quantity: 'quantity',
    currency: 'Currency',
    buy: 'Buy',
    sell: 'Sell',
    error: 'Positive number required',

    // Confirm dialog
    confirm: {
      header: 'Order Quote',
      refresh: {
        message: 'Market rates will automatically refresh every',
        unit: 'seconds'
      },
      purchase: 'Purchase',
      transaction: 'Transaction fee',
      error: {
        quote: 'Error fetching quote',
        trade: 'Error confirming trade'
      }
    }
  }
};
